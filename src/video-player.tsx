import React, {useState} from 'react';
import IVSPlayer, {TextMetadataCue} from 'amazon-ivs-react-native-player';
import {Button, Divider, Layout, Text} from '@ui-kitten/components';
import {Image, SafeAreaView, StyleSheet, View} from 'react-native';
import {useMutation, useQuery} from 'react-query';

const API_BASE_URL =
  'https://xq7f8bvp82.execute-api.us-east-1.amazonaws.com/Prod';

const getRandom = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min)) + min;
};

enum MetadataType {
  Poll = 'poll',
  AddToBasket = 'add_to_basket',
}

interface MetadataEnvelope {
  version: string;
}

interface PollMetadata extends MetadataEnvelope {
  type: MetadataType.Poll;
  data: {
    id: string;
  };
}

interface GETPollResponse {
  data: {
    id: string;
    question: string;
    options: {
      id: string;
      label: string;
    }[];
  };
}

interface AddToBasketMetadataProduct {
  id: string;
  description: string;
  imageURL: string;
  price: string;
}

interface AddToBasketMetadata extends MetadataEnvelope {
  type: MetadataType.AddToBasket;
  data: {
    product: AddToBasketMetadataProduct;
  };
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
  'https://805be2236c77.us-east-1.playback.live-video.net/api/video/v1/us-east-1.657370178426.channel.KixHEGzTCgC9.m3u8';

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
        handleTextMetadataCue(cue);

        // handleTextMetadataCue({
        //   text: '{"type":"poll","question":"Time for DRG?","options":[{"id":"abc","label":"Yes"},{"id":"def","label":"No"}]}',
        //   textDescription: '',
        //   type: '',
        // });
        // handleTextMetadataCue({
        //   text: '{"type":"add_to_basket","product":{"description":"SPEED EVOLVE 5\\" 2 IN 1 SHORTS","price":"£36.00","imageURL":"https://cdn.shopify.com/s/files/1/0098/8822/products/Speed52In1Short_M_BlackA1A9HA1A9H-BBBB.A1-Edit_BK_855x.jpg?v=1649254796"}}',
        //   textDescription: '',
        //   type: '',
        // });
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
  const submitVoteMutation = useMutation(async vote => {
    await fetch(`${API_BASE_URL}/polls/${props.metadata.data.id}/votes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(vote),
    });
  });

  const {isLoading, isError, data, error} = useQuery(
    ['poll', props.metadata.data.id],
    async () => {
      const res = await fetch(
        `${API_BASE_URL}/polls/${props.metadata.data.id}`,
      );

      const pollData: GETPollResponse = await res.json();

      return pollData.data;
    },
  );

  if (isLoading || !data) {
    return null;
  }

  if (isError) {
    console.log(error);
    return null;
  }

  return (
    <Layout level="1">
      <Text>{data.question}</Text>
      <Divider />
      <Layout>
        {data.options.map(opt => {
          return (
            <Button
              key={opt.id}
              style={videoPollStyles.button}
              onPress={() => {
                submitVoteMutation.mutate({
                  answer: opt.id,
                  userId: getRandom(1, 99999).toString(),
                } as any);
              }}>
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
          {props.metadata.data.product.description}
        </Text>
        <Text>{props.metadata.data.product.price}</Text>
      </View>
      <View style={addToBasketStyles.footer}>
        <Image
          style={addToBasketStyles.productImage}
          source={{
            uri: props.metadata.data.product.imageURL,
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
