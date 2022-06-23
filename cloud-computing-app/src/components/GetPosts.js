/* eslint-disable import/no-anonymous-default-export */
import React, {useState, useContext} from "react";
import { AccountContext } from "./Accounts";
import GetAxiosInstance from "../logic/axios.instance";

export default () => {
    const axios = GetAxiosInstance();
    const [posts, setPosts] = useState();

    const { getSession } = useContext(AccountContext);

    const fetchPosts = async () => {
        const path = "/posts"
        const response = await axios.get(path);
        
    };

    return (<div>
        <button onClick={fetchPosts}>Fetch posts</button>
    </div>);
}