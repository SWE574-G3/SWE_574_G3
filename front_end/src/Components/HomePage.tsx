import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Story from './Story';
import axios from 'axios';
import NavBar from './NavBar';


interface Story {
    id: number;
    text: string;
    header: string;
    user: {
      id: number;
      name: string;
    };
    likes: number[]
    comments:{
      text:string;
      user: {
        id: number;
        name: string;
      };
      likes:number[]
    }[]
  }
const HomePage: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);

  useEffect(() => {
    const fetchStories = async () => {
      const response = await axios.get<Story[]>('http://localhost:8080/stories', {
        withCredentials: true
      });
      setStories(response.data);
    };

    fetchStories();
  }, []);

  return (
    <div>
      <NavBar/>
      <h1 style={{ textAlign: "center" }}>Recent Stories</h1>
      <ul style={{listStyle:"none"}}>
        {stories.reverse().map((story: Story) => (
          <li key={story.id}>
            <Story story={story} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HomePage;