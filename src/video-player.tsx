import React, {useState} from 'react';
import IVSPlayer, {TextMetadataCue} from 'amazon-ivs-react-native-player';
import {Button, Divider, Layout, Text} from '@ui-kitten/components';
import {Image, SafeAreaView, StyleSheet, View} from 'react-native';

enum MetadataType {
  Poll = 'poll',
  AddToBasket = 'add_to_basket',
}

interface PollMetadataOption {
  id: string;
  label: string;
}

interface PollMetadata {
  type: MetadataType.Poll;
  question: string;
  options: PollMetadataOption[];
}

interface AddToBasketMetadataProduct {
  id: string;
  description: string;
  imageURL: string;
  price: string;
}

interface AddToBasketMetadata {
  type: MetadataType.AddToBasket;
  product: AddToBasketMetadataProduct;
}

type Metadata = PollMetadata | AddToBasketMetadata;

const parseMetadata = (metadata: string) => {
  try {
    return JSON.parse(metadata) as Metadata;
  } catch (e) {
    console.error(e);
    return null;
  }
};

const URL =
  'https://fcc3ddae59ed.us-west-2.playback.live-video.net/api/video/v1/us-west-2.893648527354.channel.xhP3ExfcX8ON.m3u8';

export const VideoPlayer = () => {
  const [activeMetadata, setActiveMetadata] = useState<Metadata | null>(null);

  const handleTextMetadataCue = async (cue: TextMetadataCue) => {
    const metadata = parseMetadata(cue.text);
    setActiveMetadata(metadata);
  };

  return (
    <IVSPlayer
      streamUrl={URL}
      onTextMetadataCue={cue => {
        // handleTextMetadataCue({
        //   text: '{"type":"poll","question":"Time for DRG?","options":[{"id":"abc","label":"Yes"},{"id":"def","label":"No"}]}',
        //   textDescription: '',
        //   type: '',
        // });
        handleTextMetadataCue({
          text: '{"type":"add_to_basket","product":{"description":"SPEED EVOLVE 5\\" 2 IN 1 SHORTS","price":"£36.00","imageURL":"https://cdn.shopify.com/s/files/1/0098/8822/products/Speed52In1Short_M_BlackA1A9HA1A9H-BBBB.A1-Edit_BK_855x.jpg?v=1649254796"}}',
          textDescription: '',
          type: '',
        });
      }}>
      {activeMetadata !== null ? (
        <SafeAreaView>
          <View style={metadataRendererStyles.container}>
            <MetadataRenderer metadata={activeMetadata} />
          </View>
        </SafeAreaView>
      ) : null}
    </IVSPlayer>
  );
};

const metadataRendererStyles = StyleSheet.create({
  container: {
    padding: 30,
  },
});

interface MetadataRendererProps {
  metadata: Metadata;
}

const MetadataRenderer = (props: MetadataRendererProps) => {
  const type = props.metadata.type;

  switch (type) {
    case MetadataType.Poll:
      return <VideoPoll metadata={props.metadata} />;
    case MetadataType.AddToBasket:
      return <VideoAddToBasket metadata={props.metadata} />;
    default:
      console.error(`unable to handle metadata type ${type}`);
      return null;
  }
};

interface VideoPollProps {
  metadata: PollMetadata;
}

const VideoPoll = (props: VideoPollProps) => {
  return (
    <Layout level="1">
      <Text>{props.metadata.question}</Text>
      <Divider />
      <Layout>
        {props.metadata.options.map(opt => {
          return (
            <Button key={opt.id} style={videoPollStyles.button}>
              {opt.label}
            </Button>
          );
        })}
      </Layout>
    </Layout>
  );
};

const videoPollStyles = StyleSheet.create({
  button: {
    marginTop: 8,
  },
});

interface VideoAddToBasketProps {
  metadata: AddToBasketMetadata;
}

const VideoAddToBasket = (props: VideoAddToBasketProps) => {
  return (
    <Layout level="1" style={addToBasketStyles.container}>
      <View>
        <Text style={addToBasketStyles.description}>
          {props.metadata.product.description}
        </Text>
        <Text>{props.metadata.product.price}</Text>
      </View>
      <View style={addToBasketStyles.footer}>
        <Image
          style={addToBasketStyles.productImage}
          source={{
            uri: props.metadata.product.imageURL,
          }}
        />
        <View>
          <Button>Buy now</Button>
        </View>
      </View>
    </Layout>
  );
};

const addToBasketStyles = StyleSheet.create({
  container: {
    backgroundColor: '#efefef',
    padding: 8,
  },
  description: {
    fontWeight: 'bold',
  },
  productImage: {
    width: 85,
    height: 150,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
});
