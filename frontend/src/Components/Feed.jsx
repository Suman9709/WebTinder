import React, { useEffect, useState } from 'react'
import { BASE_URL } from './constant'
import { useDispatch, useSelector } from 'react-redux'
import { addFeed } from '../Utils/feedSlice';
import axios from 'axios';
import UserCard from './UserCard';

const Feed = () => {

  const dispatch = useDispatch();

  const feed = useSelector((store) => store.feed);
  // if (feed && feed.length > 0) return;
  const getFeed = async () => {
    if (feed && feed.length > 0) return;
    try {
      const response = await axios.get(BASE_URL + "/feed", {
        withCredentials: true,
      });
      console.log("feed: ", response.data.data);

      dispatch(addFeed(response.data.data)); // this will add the feed to the store
    } catch (error) {
      console.error(error)
    }
  }
  // this will get the feed when the page will load
  useEffect(() => {
    getFeed();
  }, [])

  // if (!feed) return;

  if (!feed || feed.length === 0)
    return <h1 className="flex justify-center my-20">No new users found!</h1>;

  return (
    <div className="flex justify-center my-10">
      {feed && <UserCard user={feed[0]} />}
    </div>
  );
}

export default Feed