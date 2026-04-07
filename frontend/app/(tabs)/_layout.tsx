import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight } from '@/constants/theme';
 
/**
 * Bottom Navigation de SmartRewards
 * Tabs: Inicio · Ofertas · Ubicaciones · Perfil
 *
 * Adaptado del BottomNavigation.tsx de Figma Make:
 *   - lucide-react → @expo/vector-icons (Ionicons)
 *   - div/button   → Expo Router <Tabs> (maneja estado activo automáticamente)
 *   - fixed bottom → tabBar nativo de iOS/Android
 */
 
type IoniconsName = keyof typeof Ionicons.glyphMap;
 
interface TabConfig {
  name: string;
  title: string;
  icon: IoniconsName;
  iconActive: IoniconsName;
}
 
const TABS: TabConfig[] = [
  {
    name: 'index',
    title: 'Inicio',
    icon: 'home-outline',
    iconActive: 'home',
  },
  {
    name: 'promotions',
    title: 'Ofertas',
    icon: 'pricetag-outline',
    iconActive: 'pricetag',
  },
  {
    name: 'locations',
    title: 'Ubicaciones',
    icon: 'location-outline',
    iconActive: 'location',
  },
  {
    name: 'profile',
    title: 'Perfil',
    icon: 'person-outline',
    iconActive: 'person',
  },
];
 
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
 
        // ── Tab Bar ─────────────────────────────────────────
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.navyOpacity10,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
        },
 
        // ── Colores ─────────────────────────────────────────
        tabBarActiveTintColor: Colors.yellow,
        tabBarInactiveTintColor: Colors.navyOpacity70,
 
        // ── Etiqueta ─────────────────────────────────────────
        tabBarLabelStyle: {
          fontSize: FontSize.xs,
          fontWeight: FontWeight.medium,
          marginTop: 2,
        },
      }}
    >
      {TABS.map(tab => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused, color }) => (
              <Ionicons
                name={focused ? tab.iconActive : tab.icon}
                size={24}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
 