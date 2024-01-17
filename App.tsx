import { StatusBar } from "expo-status-bar";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  View,
  Image,
  Platform,
  Button,
} from "react-native";
import * as MediaLibrary from "expo-media-library";
import { useEffect, useRef, useState } from "react";
import PhotosGridx from "./views/album/components/photoGrid";
import Realm from "realm";
import MediaMetadataSchema from "./schema/mediaMetaDataSchema";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";

const { width } = Dimensions.get("window");

export default function App() {
  const [albums, setAlbums] = useState<MediaLibrary.Album[]>([]);

  const [expoPushToken, setExpoPushToken] = useState<String>();
  const [notification, setNotification] =
    useState<Notifications.Notification>();
  const notificationListener = useRef<MediaLibrary.Subscription>();
  const responseListener = useRef<MediaLibrary.Subscription>();

  useEffect(() => {
    const fetchAlbums = async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access media library denied");
        return;
      }

      const albums = await MediaLibrary.getAlbumsAsync();
      setAlbums(albums);
    };

    //uncomment to fetch albums
    // fetchAlbums();
  }, []);

  useEffect(() => {
    async function getMedia() {
      const media = await MediaLibrary.getAssetsAsync({
        album: "-1739773001",
        first: 10,
        mediaType: "photo",
        sortBy: "creationTime",
        // after: endCursor,
      });

      console.log(media);
    }
    // getMedia();
  }, [notification]);

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) =>
      setExpoPushToken(token)
    );

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);

        console.log(notification, "notification");
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response, "response");
      });

    return () => {
      if (notificationListener.current != undefined) {
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.LOW,
        vibrationPattern: [0, 250, 250, 250],
        // lightColor: "#FF231F7C",
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        alert("Failed to get push token for push notification!");
        return;
      }

      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId: Constants?.expoConfig?.extra?.eas.projectId,
        })
      ).data;
    } else {
      alert("Must use physical device for Push Notifications");
    }

    return token;
  }

  function getDatePlus5HoursInSeconds() {
    const currentDate = new Date();
    const datePlus5Hours = new Date(currentDate.getTime() + 5 * 60 * 60 * 1000);
    return Math.floor(datePlus5Hours.getTime() / 1000);
  }

  function getCurrentTime() {
    const date = new Date();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    return `${hours < 10 ? "0" + hours : hours}:${
      minutes < 10 ? "0" + minutes : minutes
    }:${seconds < 10 ? "0" + seconds : seconds}`;
  }

  async function schedulePushNotification() {
    const datePlus5HoursInSeconds = getDatePlus5HoursInSeconds();
    const currentTime = getCurrentTime();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "You've got mail! 📬",
        body: `${currentTime} notified at`,
        vibrate: [0],
        data: {
          message: `${currentTime} notified at`,
        },
      },

      trigger: { seconds: datePlus5HoursInSeconds },
    });
  }

  //uncomment to show with albums
  // const renderAlbum = ({ item }: { item: MediaLibrary.Album }) => {
  //   return (
  //     <View style={styles.albumContainer}>
  //       <Text style={styles.albumTitle}>{item.title}</Text>
  //       <PhotosGridx albumId={item.id} key={item.id} />
  //     </View>
  //   );
  // };

  // return (
  //   <FlatList
  //     data={albums}
  //     renderItem={renderAlbum}
  //     keyExtractor={(album) => album.id}
  //   />
  // );
  return (
    <View style={{ flex: 1, paddingTop: 50 }}>
      {/* <StatusBar translucent /> */}

      {/* <PhotosGridx albumId={"-1739773001"} /> */}

      <Button
        title="Press to schedule a notification"
        onPress={async () => {
          await schedulePushNotification();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  albumContainer: {
    marginBottom: 20,
  },
  albumTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  image: {
    width: width / 3,
    height: width / 3,
    marginRight: 2,
    marginBottom: 2,
  },
});
