import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { COLORS } from '@vaayu/shared';
import { HomeScreen } from '../screens/HomeScreen';

/** Param list for the root stack — extended per phase as screens are added. */
export type RootStackParamList = {
  Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

/** Root navigation stack for the Vaayu mobile app. */
export function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.cream },
        headerTintColor: COLORS.ink,
        contentStyle: { backgroundColor: COLORS.cream },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Vaayu' }} />
    </Stack.Navigator>
  );
}
