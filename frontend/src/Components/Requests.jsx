import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { BASE_URL } from './constant'
import { useDispatch, useSelector } from 'react-redux'
import { addRequest, removeRequest } from '../Utils/requestSlice'

const Requests = () => {
  const dispatch = useDispatch();
  const requests = useSelector((store) => store.requests)

  const reviewRequest = async (status, _id) => {
    try {
      const response = await axios.post(BASE_URL + "/request/review/" + status + "/" + _id, {}, {
        withCredentials: true,
      });
      // console.log(response.data);
      dispatch(removeRequest(_id))
    } catch (error) {
      console.error(error)
    }
  }


  const fetchRequest = async () => {
    try {
      const response = await axios.get(BASE_URL + "/user/request/received", {
        withCredentials: true,
      });
      // console.log("response request", response.data);

      dispatch(addRequest(response?.data.data));

    }
    catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchRequest();
  }, [])

  if (!requests) return;
  if (requests.length === 0) {
    return <h1 className="text-center my-24 text-xl font-bold">No Request Found</h1>;
  }

  return (
    <div className="min-h-screen bg-base-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-primary my-16">Your Connection Requests</h2>

        {requests.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">No Connections Found</p>
        ) : (
          <div className="space-y-2">
            {requests.map((request) => {

              const user = request.fromUserId;
              if (!user) return null;
              const { _id, firstName, lastName, age, gender, description, imageUrl } = user;

              return (
                <div key={request._id} className="flex p-4 bg-base-300 shadow-md hover:shadow-md transition duration-300 rounded-xl w-1/2 mx-auto ">
                  <img
                    src={imageUrl}
                    alt="profile"
                    className="w-20 h-16 rounded-full object-cover border-4 border-primary"
                  />

                  <div className="ml-6 w-full flex justify-between items-center">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <h3 className="text-xl font-semibold text-white">{firstName} {lastName}</h3>
                      {age && gender && (
                        <p className="text-sm text-white italic">{gender}, Age {age}</p>
                      )}
                      {description && <p>{description}</p>}
                    </div>
                    <div className="flex gap-2">
                      <button className="btn btn-primary" onClick={() => reviewRequest("accepted", request._id)}>Accept</button>
                      <button className="btn btn-secondary" onClick={() => reviewRequest("rejected", request._id)}>Reject</button>
                    </div>
                  </div>
                </div>
              );
            })}

          </div>
        )}
      </div>
    </div>
  )
}

export default Requests