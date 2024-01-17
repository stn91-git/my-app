// Define the schema for the media metadata
const MediaMetadataSchema = {
    name: 'MediaMetadata',
    properties: {
      mediaId: 'string',
      backedUpLocally: 'bool',
      backedUpCloub: 'bool'
    },
  };

  export default MediaMetadataSchema;