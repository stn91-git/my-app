import React, { useEffect, useState } from "react";
import { View, Image, FlatList, Text } from "react-native";
import * as MediaLibrary from "expo-media-library";
import MediaMetadataSchema from "../../../schema/mediaMetaDataSchema";
import Realm from "realm";

const PhotosGridx = ({ albumId }: { albumId: string }) => {
  const [photos, setPhotos] = useState<MediaLibrary.Asset[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [endCursor, setendCursor] = useState("");

  useEffect(() => {
    // let after = null;

    const getPhotosFromAlbum = async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access media library denied");
        return;
      }
      const batchSize = 100;
      const media = await MediaLibrary.getAssetsAsync({
        album: albumId,
        first: batchSize,
        mediaType: "photo",
        sortBy: "creationTime",
        // after: endCursor,
      });
      setPhotos(media.assets);
      setendCursor(media.endCursor);
      setTotalCount(media.totalCount);
      if (media.hasNextPage) {
        getPhotosFromAlbum();
      }
    };

    getPhotosFromAlbum();
  }, []);

  // useEffect(() => {
  //   const realm = new Realm({ schema: [MediaMetadataSchema] });

  //   const unbackedPhotos = photos.filter(
  //     (photo) =>
  //       !realm
  //         .objects("MediaMetadata")
  //         .some(
  //           (metada) => photo.id === metada.mediaId && metada.backedUpLocally
  //         )
  //   );

  //   realm.write(() => {
  //     unbackedPhotos.forEach((photo) => {
  //       realm.create("MediaMetadata", {
  //         mediaId: photo.id,
  //         backedUpLocally: true,
  //       });
  //     });
  //   });
  // }, [photos]);

  return (
    <View>
      <Text>{albumId}</Text>

      <FlatList
        data={photos}
        numColumns={3}
        renderItem={({ item }) => (
          <Image
            key={item.id}
            source={{ uri: item.uri }}
            style={{ width: 100, height: 100 }}
          />
        )}
        keyExtractor={(photo) => photo.id.toString()}
      />
    </View>
  );
};

export default PhotosGridx;
