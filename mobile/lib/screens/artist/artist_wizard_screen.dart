import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../../engine/constants.dart';
import '../../engine/enums.dart';
import '../../services/history_service.dart';
import '../../services/valuation_service.dart';
import '../../state/auth.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_typography.dart';
import '../../widgets/buttons.dart';
import '../../widgets/common.dart';
import '../../widgets/vaayu_app_bar.dart';
import '../../widgets/vaayu_text_field.dart';
import 'artist_result_screen.dart';

/// Screens 09–12 — the 4-step artist pricing wizard.
class ArtistWizardScreen extends ConsumerStatefulWidget {
  const ArtistWizardScreen({super.key});

  @override
  ConsumerState<ArtistWizardScreen> createState() => _ArtistWizardScreenState();
}

class _ArtistWizardScreenState extends ConsumerState<ArtistWizardScreen> {
  final _page = PageController();
  int _step = 0;
  bool _submitting = false;
  String? _error;

  // Step 1 — you
  CareerStage _careerStage = CareerStage.midCareer;
  final _years = TextEditingController(text: '6');
  final _exhibitions = TextEditingController(text: '4');
  final _institutional = TextEditingController();

  // Step 2 — artwork
  Uint8List? _image;
  String _mime = 'image/jpeg';
  String _tradition = '';
  String _medium = '';
  final _style = TextEditingController();
  bool _inches = true;
  final _width = TextEditingController();
  final _height = TextEditingController();
  ArtworkCondition _condition = ArtworkCondition.excellent;
  ArtComplexity _complexity = ArtComplexity.moderate;
  EditionType _edition = EditionType.unique;
  bool _signed = true;
  bool _framed = false;

  // Step 3 — selling intent
  final Set<SellingChannel> _channels = {SellingChannel.gallery, SellingChannel.direct};
  double _galleryCut = kGalleryCutDefault.toDouble();
  PricingPosture _posture = PricingPosture.balanced;
  MarketPositioning _positioning = MarketPositioning.standard;

  // Step 4 — costs & context
  final _materials = TextEditingController();
  final _hours = TextEditingController();
  final _rate = TextEditingController();
  final _framingCost = TextEditingController();
  final _shippingCost = TextEditingController();
  final _pastSales = TextEditingController();
  final _recognition = TextEditingController();

  @override
  void dispose() {
    _page.dispose();
    for (final c in [
      _years, _exhibitions, _institutional, _style, _width, _height,
      _materials, _hours, _rate, _framingCost, _shippingCost, _pastSales, _recognition,
    ]) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _pickImage() async {
    final x = await ImagePicker().pickImage(
      source: ImageSource.gallery,
      maxWidth: 2000,
      imageQuality: 82,
    );
    if (x == null) return;
    final bytes = await x.readAsBytes();
    setState(() {
      _image = bytes;
      _mime = x.mimeType ?? (x.path.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg');
    });
  }

  void _next() {
    setState(() => _error = null);
    if (_step == 1) {
      if (_image == null) return setState(() => _error = 'Please add a photo of the artwork.');
      if (_tradition.isEmpty) return setState(() => _error = 'Choose a tradition or style.');
      if (_medium.isEmpty) return setState(() => _error = 'Choose a medium.');
      if ((double.tryParse(_width.text) ?? 0) <= 0 || (double.tryParse(_height.text) ?? 0) <= 0) {
        return setState(() => _error = 'Enter the width and height.');
      }
    }
    if (_step < 3) {
      _page.nextPage(duration: const Duration(milliseconds: 250), curve: Curves.easeInOutCubic);
      setState(() => _step += 1);
    } else {
      _submit();
    }
  }

  void _back() {
    if (_step == 0) {
      context.pop();
      return;
    }
    _page.previousPage(duration: const Duration(milliseconds: 250), curve: Curves.easeInOutCubic);
    setState(() => _step -= 1);
  }

  double _toCm(String v) {
    final n = double.tryParse(v) ?? 0;
    return _inches ? n * kCmPerInch : n;
  }

  int? _i(TextEditingController c) => c.text.trim().isEmpty ? null : int.tryParse(c.text.trim());

  Future<void> _submit() async {
    if (_channels.isEmpty) return setState(() => _error = 'Select at least one channel.');
    final user = ref.read(currentUserProvider);
    if (user == null) {
      setState(() => _error = 'Please sign in to get your pricing.');
      return;
    }
    setState(() {
      _submitting = true;
      _error = null;
    });
    try {
      final service = ValuationService(ref.read(supabaseProvider));
      final result = await service.priceArtwork(
        imageBytes: _image!,
        mime: _mime,
        tradition: _tradition,
        medium: _medium,
        style: _style.text.trim(),
        heightCm: _toCm(_height.text),
        widthCm: _toCm(_width.text),
        condition: _condition,
        editionType: _edition,
        seriesName: null,
        signed: _signed,
        framed: _framed,
        careerStage: _careerStage,
        yearsSelling: int.tryParse(_years.text) ?? 0,
        exhibitions3yr: int.tryParse(_exhibitions.text) ?? 0,
        institutionalCollectors: _institutional.text.trim(),
        complexity: _complexity,
        positioning: _positioning,
        posture: _posture,
        channels: _channels.toList(),
        galleryCutPct: _galleryCut,
        materialsCostInr: _i(_materials) ?? 0,
        hoursWorked: _i(_hours) ?? 0,
        hourlyRateInr: _i(_rate),
        framingCostInr: _i(_framingCost) ?? 0,
        shippingCostInr: _i(_shippingCost) ?? 0,
        pastSalePrices: _pastSales.text.trim(),
        recognition: _recognition.text.trim(),
      );
      // Best-effort: persist to history without blocking the result.
      final user = ref.read(currentUserProvider);
      if (user != null) {
        HistoryService(ref.read(supabaseProvider))
            .saveArtistPricing(
              userId: user.id,
              result: result,
              tradition: _tradition,
              medium: _medium,
              careerStage: _careerStage.key,
              imageBytes: _image,
              imageMime: _mime,
            )
            .ignore();
      }
      if (!mounted) return;
      Navigator.of(context).push(
        MaterialPageRoute(builder: (_) => ArtistResultScreen(result: result, image: _image)),
      );
    } catch (e) {
      if (mounted) setState(() => _error = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  static const _titles = ['About you', 'The artwork', 'How you\'ll sell it', 'Costs & context'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const VaayuAppBar(showBack: true),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  StepperPills(count: 4, current: _step),
                  const SizedBox(height: 16),
                  EyebrowLabel('Step ${_step + 1} of 4'),
                  const SizedBox(height: 4),
                  Text(_titles[_step], style: AppTypography.displaySmall),
                ],
              ),
            ),
            Expanded(
              child: PageView(
                controller: _page,
                physics: const NeverScrollableScrollPhysics(),
                children: [_step1(), _step2(), _step3(), _step4()],
              ),
            ),
            if (_error != null)
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 8),
                child: ErrorBanner(_error!),
              ),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 20),
              child: Row(
                children: [
                  TextButton(
                    onPressed: _submitting ? null : _back,
                    child: Text(_step == 0 ? 'Cancel' : 'Back',
                        style: AppTypography.bodyMedium.copyWith(color: AppColors.grey600)),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: PrimaryButton(
                      label: _step < 3 ? 'Continue' : 'Get my pricing',
                      loading: _submitting,
                      onPressed: _next,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _pad(List<Widget> children) => SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: children),
      );

  Widget _gap([double h = 20]) => SizedBox(height: h);

  Widget _fieldLabel(String s) => Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: Text(s.toUpperCase(),
            style: AppTypography.labelMedium.copyWith(color: AppColors.burgundy, letterSpacing: 1, fontSize: 11)),
      );

  Widget _chips<T>(List<T> values, T? selected, String Function(T) label, ValueChanged<T> onTap,
      {bool Function(T)? isSel}) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: values
          .map((v) => VaayuChip(
                label: label(v),
                selected: isSel != null ? isSel(v) : v == selected,
                onTap: () => onTap(v),
              ))
          .toList(),
    );
  }

  // ── Step 1 ──
  Widget _step1() => _pad([
        _fieldLabel('Career stage'),
        _chips<CareerStage>(CareerStage.values, _careerStage, (s) => s.label,
            (s) => setState(() => _careerStage = s)),
        _gap(6),
        Text(_careerStage.description, style: AppTypography.bodySmall),
        _gap(),
        Row(children: [
          Expanded(
              child: VaayuTextField(
                  label: 'Years selling', controller: _years, keyboardType: TextInputType.number)),
          const SizedBox(width: 16),
          Expanded(
              child: VaayuTextField(
                  label: 'Exhibitions (3 yr)', controller: _exhibitions, keyboardType: TextInputType.number)),
        ]),
        _gap(),
        VaayuTextField(
            label: 'Institutional collectors',
            controller: _institutional,
            hint: 'e.g. NGMA, one corporate',
            helper: 'Optional — leave blank if none yet.'),
      ]);

  // ── Step 2 ──
  Widget _step2() => _pad([
        _imagePicker(),
        _gap(),
        _fieldLabel('Tradition / style'),
        _chips<Tradition>(kTraditions, null, (t) => t.label,
            (t) => setState(() => _tradition = t.key),
            isSel: (t) => t.key == _tradition),
        _gap(),
        _fieldLabel('Medium'),
        _chips<Medium>(kMediums, null, (m) => m.label,
            (m) => setState(() => _medium = m.key),
            isSel: (m) => m.key == _medium),
        _gap(),
        VaayuTextField(label: 'Style / description', controller: _style, hint: 'e.g. abstract, folk'),
        _gap(),
        Row(children: [
          _fieldLabel('Size'),
          const Spacer(),
          _unitToggle(),
        ]),
        Row(children: [
          Expanded(
              child: VaayuTextField(label: 'Width', controller: _width, keyboardType: TextInputType.number)),
          const SizedBox(width: 16),
          Expanded(
              child: VaayuTextField(label: 'Height', controller: _height, keyboardType: TextInputType.number)),
        ]),
        _gap(),
        _fieldLabel('Condition'),
        _chips<ArtworkCondition>(ArtworkCondition.values, _condition, (c) => c.label,
            (c) => setState(() => _condition = c)),
        _gap(),
        _fieldLabel('Complexity'),
        _chips<ArtComplexity>(ArtComplexity.values, _complexity, (c) => c.label,
            (c) => setState(() => _complexity = c)),
        _gap(),
        _fieldLabel('Edition'),
        _chips<EditionType>(EditionType.values, _edition, (e) => e.label, (e) => setState(() => _edition = e)),
        _gap(),
        Row(children: [
          _checkbox('Signed', _signed, (v) => setState(() => _signed = v)),
          const SizedBox(width: 24),
          _checkbox('Framed', _framed, (v) => setState(() => _framed = v)),
        ]),
      ]);

  // ── Step 3 ──
  Widget _step3() => _pad([
        _fieldLabel('Where will you sell this?'),
        _chips<SellingChannel>(SellingChannel.values, null, (c) => c.label, (c) {
          setState(() => _channels.contains(c) ? _channels.remove(c) : _channels.add(c));
        }, isSel: (c) => _channels.contains(c)),
        _gap(),
        _fieldLabel('Gallery commission — ${_galleryCut.round()}%'),
        Slider(
          value: _galleryCut,
          min: kGalleryCutMin.toDouble(),
          max: kGalleryCutMax.toDouble(),
          divisions: (kGalleryCutMax - kGalleryCutMin) ~/ 5,
          activeColor: AppColors.gold,
          label: '${_galleryCut.round()}%',
          onChanged: (v) => setState(() => _galleryCut = v),
        ),
        _gap(),
        _fieldLabel('Market positioning'),
        _chips<MarketPositioning>(MarketPositioning.values, _positioning, (p) => p.label,
            (p) => setState(() => _positioning = p)),
        _gap(),
        _fieldLabel('Pricing posture'),
        _chips<PricingPosture>(PricingPosture.values, _posture, (p) => p.label,
            (p) => setState(() => _posture = p)),
      ]);

  // ── Step 4 ──
  Widget _step4() => _pad([
        Text('All optional — used for a cost floor (never sell below it) and pass-through add-ons.',
            style: AppTypography.bodySmall),
        _gap(),
        Row(children: [
          Expanded(child: VaayuTextField(label: 'Materials (₹)', controller: _materials, keyboardType: TextInputType.number)),
          const SizedBox(width: 16),
          Expanded(child: VaayuTextField(label: 'Hours worked', controller: _hours, keyboardType: TextInputType.number)),
        ]),
        _gap(),
        Row(children: [
          Expanded(child: VaayuTextField(label: 'Hourly rate (₹)', controller: _rate, hint: 'default 300', keyboardType: TextInputType.number)),
          const SizedBox(width: 16),
          Expanded(child: VaayuTextField(label: 'Framing (₹)', controller: _framingCost, keyboardType: TextInputType.number)),
        ]),
        _gap(),
        VaayuTextField(label: 'Shipping (₹)', controller: _shippingCost, keyboardType: TextInputType.number),
        _gap(),
        VaayuTextField(label: 'Past sale prices', controller: _pastSales, hint: 'e.g. ₹15,000 to ₹25,000'),
        _gap(),
        VaayuTextField(label: 'Awards / press', controller: _recognition, maxLines: 2),
      ]);

  Widget _imagePicker() {
    if (_image != null) {
      return Column(children: [
        ClipRRect(
          borderRadius: AppRadius.card,
          child: Image.memory(_image!, height: 200, width: double.infinity, fit: BoxFit.cover),
        ),
        const SizedBox(height: 10),
        TertiaryButton(label: 'Choose a different photo', onPressed: _pickImage),
      ]);
    }
    return GestureDetector(
      onTap: _pickImage,
      child: Container(
        height: 150,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: AppColors.grey50,
          borderRadius: AppRadius.card,
          border: Border.all(color: AppColors.grey200, style: BorderStyle.solid),
        ),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          const Icon(Icons.add_photo_alternate_outlined, size: 30, color: AppColors.gold),
          const SizedBox(height: 8),
          Text('Tap to add artwork photo', style: AppTypography.bodyMedium.copyWith(color: AppColors.burgundy)),
        ]),
      ),
    );
  }

  Widget _unitToggle() {
    return Container(
      padding: const EdgeInsets.all(2),
      decoration: BoxDecoration(border: Border.all(color: AppColors.grey100), borderRadius: AppRadius.pill),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        for (final u in [true, false])
          GestureDetector(
            onTap: () => setState(() => _inches = u),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              decoration: BoxDecoration(
                color: _inches == u ? AppColors.burgundy : Colors.transparent,
                borderRadius: AppRadius.pill,
              ),
              child: Text(u ? 'in' : 'cm',
                  style: AppTypography.eyebrow.copyWith(
                      fontSize: 11, letterSpacing: 0.5, color: _inches == u ? AppColors.cream : AppColors.grey600)),
            ),
          ),
      ]),
    );
  }

  Widget _checkbox(String label, bool value, ValueChanged<bool> onChanged) {
    return GestureDetector(
      onTap: () => onChanged(!value),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Icon(value ? Icons.check_box : Icons.check_box_outline_blank,
            color: value ? AppColors.gold : AppColors.grey400, size: 22),
        const SizedBox(width: 6),
        Text(label, style: AppTypography.bodyMedium),
      ]),
    );
  }
}
