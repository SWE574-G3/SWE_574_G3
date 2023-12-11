import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Story from "../Components/StoryCard";
import axios from "axios";
import NavBar from "../Components/NavBar";
import { Radio, RadioChangeEvent, Row } from "antd";
import { ConsoleSqlOutlined } from "@ant-design/icons";

type Option = {
  label: string;
  value: string;
};

const options: Option[] = [
  { label: "All", value: "all" },
  { label: "Followings", value: "followings" },
  { label: "Recommended", value: "recommended" },
];

interface Story {
  id: number;
  text: string;
  header: string;
  user: {
    id: number;
    name: string;
  };
  labels: string[];
  likes: number[];
  comments: {
    text: string;
    user: {
      id: number;
      name: string;
    };
    likes: number[];
  }[];
}
const HomePage: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>("all");
  const nav = useNavigate();
  useEffect(() => {
    const cookieValue = document.cookie
      .split("; ")
      .find((row) => row.startsWith("jwt_Token"))
      ?.split("=")[1];

    if (!cookieValue) {
      nav("/login");
    }
  }, []);

  useEffect(() => {
    const fetchStories = async () => {
      const userIdPromise = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/users/getname`,
        {
          withCredentials: true,
        }
      );
      const userId = userIdPromise.data.id;
      const url =
        selectedOption === "all"
          ? `${import.meta.env.VITE_BACKEND_URL}/stories`
          : selectedOption === "followings"
          ? `${import.meta.env.VITE_BACKEND_URL}/stories/following`
          : `${
              import.meta.env.VITE_BACKEND_PYTHON_URL
            }/recommendations?user_id=${userId}`;
      const response = await axios.get<Story[]>(url, {
        withCredentials: true,
      });
      if (selectedOption === "recommended") {
        const secondApiResponse = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/activity/recommendedstories`,
          {
            storyIds: response.data,
          }
        );
        setStories(secondApiResponse.data);
      } else {
        setStories(response.data);
      }
    };

    fetchStories();
  }, [selectedOption]);

  const onRadioChange = (e: RadioChangeEvent) => {
    setSelectedOption(e.target.value);
  };

  return (
    <div className="bg-customGreen h-screen">
      <NavBar />
      <h1
        className="text-6xl text-white"
        style={{
          textAlign: "center",
          fontFamily: "HandWriting",
          marginTop: "40px",
          marginBottom: "30px",
        }}
      >
        Recent Stories
      </h1>
      <Row style={{ justifyContent: "center" }}>
        <Radio.Group
          style={{ margin: "5px" }}
          options={options}
          onChange={onRadioChange}
          value={selectedOption}
          optionType="button"
          buttonStyle="solid"
        />
      </Row>
      <div className="bg-gray-100 border-solid rounded-2xl mx-3 my-5 flex flex-wrap justify-center">
  {stories
    .slice()
    .reverse()
    .map((story: Story) => (
      <div key={story.id} className="p-2">
        <Story story={story} />
      </div>
    ))}
</div>


      {stories.length === 0 && (
        <h2 className="text-white text-5xl" style={{ textAlignLast: "center" }}>Nothing to show!</h2>
      )}
    </div>
  );
};

export default HomePage;
