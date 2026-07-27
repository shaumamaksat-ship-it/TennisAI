import {useState} from "react";

import ProfileHome from "./ProfileHome";
import EditProfile from "./EditProfile";
import Favorites from "./Favorites";

export default function ProfileModule(){

const[page,setPage]=useState("home");

switch(page){

case "edit":
return <EditProfile/>;

case "favorites":
return <Favorites/>;

default:
return <ProfileHome setPage={setPage}/>;

}

}
