import axios from "axios";
import { useEffect, useState } from "react";
import { SafeAreaView, Text, View, StyleSheet } from "react-native";
import { API_URL } from "../contexts/AuthContext";
import { ImageBackground } from "react-native";
import { ScrollView } from "react-native";
import { TouchableOpacity } from "react-native";
import { Image } from "react-native";
import Card from "../components/Card";
import { Feather } from "@expo/vector-icons";

interface Story {
  id: number;
  header: string;
  likes: number[];
  locations?: {
    id: number;
    lat: number;
    lng: number;
    name: string;
    country: string;
  }[];
  labels: string[];
  startDate: string;
  endDate?: string;
  decade?: string;
  comments: {
    text: string;
    user: {
      id: number;
      name: string;
    };
    likes: number[];
  }[];
}

interface User {
  id: number;
  name: string;
  photo?: string | null;
  biography?: string | null;
  stories?: Story[];
  comments?: Comment[];
  followers?: User[];
  following?: User[];
}
const Profile = ({ route, navigation }: any) => {
  const { name } = route.params;
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get<User>(`${API_URL}/users/${name}`);

        setUser(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUser();
  }, [name]);

  const handleCardPress = (storyId: number) => {
    navigation.navigate("Story", { storyId });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    back: {
      flex: 0.3,
      alignItems: "center",
      justifyContent: "center",
    },
    content: {
      flex: 1,
      backgroundColor: "white",
      borderRadius: 15,
      height: "100%",
    },
    avatarContainer: {
      alignItems: "center",
      marginBottom: 50,
    },
    avatar: {
      width: 150,
      height: 150,
      borderRadius: 75,
      marginBottom: 5,
    },
    title: {
      fontSize: 35,
      fontWeight: "bold",
      textAlign: "center",
      marginTop: 10,
    },
    bio: {
      fontSize: 17,
      textAlign: "center",
      marginTop: 10,
    },
    background: {
      flex: 1,
      resizeMode: "cover", // You can adjust the resizeMode as needed
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
    },
  });

  return (
    <ImageBackground
      source={require("../assets/fall.gif")} // Replace with the actual path to your GIF
      style={styles.background}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView>
          <View style={styles.back}>
            <View style={styles.header}>
              <TouchableOpacity
                style={{ marginRight: 20 }}
                onPress={() => navigation.goBack()}
              >
                <Feather name="arrow-left" size={30} color="white" />
              </TouchableOpacity>

              <Image
                source={{
                  uri: "https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50",
                }}
                style={styles.avatar}
              />

              <TouchableOpacity style={{ marginLeft: 20 }}>
                <Feather name="user-plus" size={30} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>{user?.name}</Text>
            <Text style={styles.bio}>{user?.biography}</Text>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                marginTop: 10,
              }}
            >
              <Text style={{ marginRight: 4 }}>
                <Feather name="book" size={25} color="#212121" />{" "}
                {user?.stories?.length}
              </Text>
              <Text>
                <Feather name="users" size={25} color="#212121" />{" "}
                {user?.followers?.length}
              </Text>
            </View>
            <View style={{ marginTop: 10, backgroundColor: "white" }}>
              <View>
                <Card
                  title="The Removal of Lenin's Statu from the center of Baku"
                  date="29.11.1992 - 2000"
                  location="Azerbaijan, Turkey"
                  labels={[
                    "memories",
                    "family",
                    "happy",
                    "life",
                    "fun",
                    "childhood",
                    "test",
                    "story",
                    "sea",
                    "love",
                  ]}
                  name="Rauf Eminov"
                  likes={2}
                  comments={4}
                />
                {user?.stories?.map((item: Story, index: number) => (
                  <>
                    <TouchableOpacity onPress={() => handleCardPress(item.id)}>
                      <Card
                        key={index}
                        title={item.header}
                        date={
                          item.decade
                            ? item.decade
                            : item.endDate
                            ? item.startDate + " - " + item.endDate
                            : item.startDate
                        }
                        location={
                          item.locations
                            ?.map((location) => location.country)
                            .join(", ") || ""
                        }
                        labels={item.labels}
                        name={user.name}
                        likes={item.likes.length}
                        comments={item.comments.length}
                      />
                    </TouchableOpacity>
                  </>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};
export default Profile;