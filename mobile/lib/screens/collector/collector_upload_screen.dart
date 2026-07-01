import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';

import '../../engine/constants.dart';
import '../../engine/enums.dart';
import '../../services/valuation_service.dart';
import '../../state/auth.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_typography.dart';
import '../../widgets/buttons.dart';
import '../../widgets/common.dart';
import '../../widgets/vaayu_app_bar.dart';
import '../../widgets/vaayu_text_field.dart';
import 'collector_result_screen.dart';

/// Screen 04 — Collector valuation intake. A photograph plus a little context,
/// then a call to the server. Kept deliberately short: one scroll, one CTA.
class CollectorUploadScreen extends ConsumerStatefulWidget {
  const CollectorUploadScreen({super.key});

  @override
  ConsumerState<CollectorUploadScreen> createState() => _CollectorUploadScreenState();
}

class _CollectorUploadScreenState extends ConsumerState<CollectorUploadScreen> {
  final _picker = ImagePicker();
  Uint8List? _image;
  String _mime = 'image/jpeg';

  bool _artistKnown = false;
  final _artistName = TextEditingController();
  String? _tradition;
  String? _medium;
  final _style = TextEditingController();

  bool _inInches = true;
  final _height = TextEditingController();
  final _width = TextEditingController();

  ArtworkCondition _condition = ArtworkCondition.good;
  final _year = TextEditingController();

  bool _submitting = false;
  String? _error;

  @override
  void dispose() {
    _artistName.dispose();
    _style.dispose();
    _height.dispose();
    _width.dispose();
    _year.dispose();
    super.dispose();
  }

  Future<void> _pick(ImageSource source) async {
    final x = await _picker.pickImage(source: source, maxWidth: 2000, imageQuality: 85);
    if (x == null) return;
    final bytes = await x.readAsBytes();
    final name = x.name.toLowerCase();
    setState(() {
      _image = bytes;
      _mime = name.endsWith('.png')
          ? 'image/png'
          : (name.endsWith('.webp') ? 'image/webp' : 'image/jpeg');
    });
  }

  double _cm(TextEditingController c) {
    final v = double.tryParse(c.text.trim()) ?? 0;
    return _inInches ? v * kCmPerInch : v;
  }

  Future<void> _submit() async {
    if (_image == null) return setState(() => _error = 'Add a photograph of the artwork.');
    if (_tradition == null) return setState(() => _error = 'Choose the tradition or style.');
    if (_medium == null) return setState(() => _error = 'Choose the medium.');
    final h = _cm(_height), w = _cm(_width);
    if (h <= 0 || w <= 0) return setState(() => _error = 'Enter the height and width.');

    setState(() {
      _submitting = true;
      _error = null;
    });
    try {
      final service = ValuationService(ref.read(supabaseProvider));
      final result = await service.valueArtwork(
        imageBytes: _image!,
        mime: _mime,
        artistKnown: _artistKnown,
        artistName: _artistName.text.trim(),
        tradition: _tradition!,
        medium: _medium!,
        style: _style.text.trim(),
        heightCm: h,
        widthCm: w,
        condition: _condition,
        yearCreated: int.tryParse(_year.text.trim()),
      );
      if (!mounted) return;
      Navigator.of(context).push(MaterialPageRoute(
        builder: (_) => CollectorResultScreen(result: result, image: _image),
      ));
    } catch (e) {
      if (mounted) setState(() => _error = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_submitting) {
      return Scaffold(
        appBar: const VaayuAppBar(),
        body: const Center(
          child: Padding(
            padding: EdgeInsets.all(32),
            child: VaayuLoading(
              status: 'Reading the work…',
              substatus: 'Weighing tradition, hand, and condition.',
            ),
          ),
        ),
      );
    }

    return Scaffold(
      appBar: const VaayuAppBar(showBack: true),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const EyebrowLabel('Collector valuation'),
              const SizedBox(height: 6),
              RichText(
                text: TextSpan(style: AppTypography.displaySmall, children: [
                  const TextSpan(text: 'Tell us about the '),
                  TextSpan(text: 'work', style: AppTypography.emphasis(AppTypography.displaySmall)),
                  const TextSpan(text: '.'),
                ]),
              ),
              const SizedBox(height: 20),

              _photo(),
              const SizedBox(height: 24),

              _label('Do you know the artist?'),
              const SizedBox(height: 10),
              Row(children: [
                _toggleChip('Yes, I know', _artistKnown, () => setState(() => _artistKnown = true)),
                const SizedBox(width: 8),
                _toggleChip('Unknown', !_artistKnown, () => setState(() => _artistKnown = false)),
              ]),
              if (_artistKnown) ...[
                const SizedBox(height: 16),
                VaayuTextField(
                    label: 'Artist name',
                    controller: _artistName,
                    hint: 'e.g. Sita Devi',
                    textCapitalization: TextCapitalization.words),
              ],
              const SizedBox(height: 24),

              _label('Tradition or style'),
              const SizedBox(height: 10),
              _chips(kTraditions.map((t) => (t.key, t.label)).toList(), _tradition,
                  (k) => setState(() => _tradition = k)),
              const SizedBox(height: 24),

              _label('Medium'),
              const SizedBox(height: 10),
              _chips(kMediums.map((m) => (m.key, m.label)).toList(), _medium,
                  (k) => setState(() => _medium = k)),
              const SizedBox(height: 16),
              VaayuTextField(
                  label: 'Style notes (optional)',
                  controller: _style,
                  hint: 'e.g. bharni, kachni, ritual motifs'),
              const SizedBox(height: 24),

              Row(children: [
                _label('Size'),
                const Spacer(),
                _unit('in', _inInches, () => setState(() => _inInches = true)),
                const SizedBox(width: 6),
                _unit('cm', !_inInches, () => setState(() => _inInches = false)),
              ]),
              const SizedBox(height: 10),
              Row(children: [
                Expanded(
                    child: VaayuTextField(
                        label: 'Height',
                        controller: _height,
                        keyboardType: TextInputType.number,
                        hint: _inInches ? '24' : '60')),
                const SizedBox(width: 16),
                Expanded(
                    child: VaayuTextField(
                        label: 'Width',
                        controller: _width,
                        keyboardType: TextInputType.number,
                        hint: _inInches ? '18' : '45')),
              ]),
              const SizedBox(height: 24),

              _label('Condition'),
              const SizedBox(height: 10),
              _chips(ArtworkCondition.values.map((c) => (c.key, c.label)).toList(), _condition.key,
                  (k) => setState(
                      () => _condition = ArtworkCondition.values.firstWhere((c) => c.key == k))),
              const SizedBox(height: 16),
              VaayuTextField(
                  label: 'Year created (optional)',
                  controller: _year,
                  keyboardType: TextInputType.number,
                  hint: 'e.g. 2019'),
              const SizedBox(height: 24),

              if (_error != null) ...[ErrorBanner(_error!), const SizedBox(height: 16)],
              PrimaryButton(label: 'Get valuation', loading: _submitting, onPressed: _submit),
              const SizedBox(height: 12),
              Text('AI guidance, not a certified appraisal.',
                  textAlign: TextAlign.center,
                  style: AppTypography.bodySmall.copyWith(color: AppColors.grey400)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _photo() {
    if (_image != null) {
      return ClipRRect(
        borderRadius: AppRadius.card,
        child: Stack(children: [
          Image.memory(_image!, height: 220, width: double.infinity, fit: BoxFit.cover),
          Positioned(
            right: 10,
            top: 10,
            child: Material(
              color: AppColors.burgundy,
              shape: const CircleBorder(),
              child: InkWell(
                customBorder: const CircleBorder(),
                onTap: () => _pick(ImageSource.gallery),
                child: const Padding(
                  padding: EdgeInsets.all(8),
                  child: Icon(Icons.edit, size: 18, color: AppColors.cream),
                ),
              ),
            ),
          ),
        ]),
      );
    }
    return VaayuCard(
      padding: EdgeInsets.zero,
      child: Column(children: [
        const SizedBox(height: 24),
        const Icon(Icons.image_outlined, size: 40, color: AppColors.gold),
        const SizedBox(height: 8),
        Text('Add a clear, straight-on photo', style: AppTypography.bodyMedium),
        Text('Good light, minimal glare.',
            style: AppTypography.bodySmall.copyWith(color: AppColors.grey400)),
        const SizedBox(height: 16),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Row(children: [
            Expanded(
                child: SecondaryButton(
                    label: 'Gallery',
                    icon: Icons.photo_library_outlined,
                    onPressed: () => _pick(ImageSource.gallery))),
            const SizedBox(width: 12),
            Expanded(
                child: SecondaryButton(
                    label: 'Camera',
                    icon: Icons.camera_alt_outlined,
                    onPressed: () => _pick(ImageSource.camera))),
          ]),
        ),
        const SizedBox(height: 20),
      ]),
    );
  }

  Widget _label(String s) => Text(s.toUpperCase(),
      style: AppTypography.eyebrow.copyWith(color: AppColors.grey600, letterSpacing: 1));

  Widget _chips(List<(String, String)> items, String? selected, ValueChanged<String> onTap) => Wrap(
        spacing: 8,
        runSpacing: 8,
        children: [
          for (final it in items)
            VaayuChip(label: it.$2, selected: it.$1 == selected, onTap: () => onTap(it.$1)),
        ],
      );

  Widget _toggleChip(String label, bool selected, VoidCallback onTap) =>
      Expanded(child: _pillButton(label, selected, onTap));

  Widget _pillButton(String label, bool selected, VoidCallback onTap) => GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          padding: const EdgeInsets.symmetric(vertical: 12),
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: selected ? AppColors.burgundy : AppColors.white,
            borderRadius: AppRadius.input,
            border: Border.all(color: selected ? AppColors.burgundy : AppColors.grey100),
          ),
          child: Text(label,
              style: AppTypography.labelLarge
                  .copyWith(color: selected ? AppColors.cream : AppColors.grey700)),
        ),
      );

  Widget _unit(String label, bool selected, VoidCallback onTap) => GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
          decoration: BoxDecoration(
            color: selected ? AppColors.gold : Colors.transparent,
            borderRadius: AppRadius.chip,
            border: Border.all(color: selected ? AppColors.gold : AppColors.grey200),
          ),
          child: Text(label,
              style: AppTypography.labelMedium
                  .copyWith(color: selected ? AppColors.white : AppColors.grey600)),
        ),
      );
}
