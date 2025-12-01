import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
    }

    // We don't strictly need the token for local notifications, but it's good practice to have the flow.
    // token = (await Notifications.getExpoPushTokenAsync()).data;
    // console.log(token);

    return token;
}

export function initializeNotifications() {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowBanner: true,
            shouldShowList: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
        }),
    });
}

export async function schedulePaymentNotification(stoneName: string, buyerName: string, remainderId: string) {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Payment Due Today! 💰",
            body: `Payment for ${stoneName} from ${buyerName} is due today.`,
            sound: true,
            data: { remainderId, url: '/(tabs)/s&r' },
        },
        trigger: null, // null means trigger immediately
    });
}
