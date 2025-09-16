import axios from 'axios';
import React, { useEffect, useState } from 'react'
import groupIcon from '/group-icon.png'
import {Link, Links} from 'react-router-dom'

function TopGroups() {
    const [name, setName] = useState("");
    const [message, setMessage] = useState("");
    const [groups, setGroups] = useState([]);
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    // Create group
    const handleCreateGroup = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${backendUrl}/groups/create`, {name});
            setMessage(res.data.message);
            handleCreateGroupForm();
            setName("");
        } catch (err) {
            setMessage("Failed: " + err);
        }
    }
    // Fetch all groups
    useEffect(() => {
        axios.get(`${backendUrl}/groups`)
            .then((response) => {
                setGroups(response.data);
        }).catch((error) => {
          console.error("Error finding groups: ", error)
        });
    }, []);

    const handleCreateGroupForm = () => {
        const formCreateGroup = document.getElementById("createGroupForm")
        if (formCreateGroup.className === 'hidden') {
            formCreateGroup.className = "block";
        } else {
          formCreateGroup.className = "hidden";
        }
    }

  return (
    <div className='bg-[#C5C3C6] p-4 pt-2 flex flex-col gap-2'>
        <h1 className='p-2 text-xl text-center'>Groups</h1>
        <hr />
        <button onClick={handleCreateGroupForm} className='p-2 bg-[#4C5C68] text-white cursor-pointer'>
            Create Group
        </button>
        <div className='hidden' id='createGroupForm'>
            <form className='flex flex-row gap-2'>
                <input required type="text" onChange={(e) => setName(e.target.value)} value={name} name='name' id='name' placeholder='Group Name' className='bg-[#DCDCDD] p-2' />
                <button onClick={handleCreateGroup} type='submit' className='p-2 text-white bg-[#4C5C68] cursor-pointer'>Create</button>
            </form>
            <p>{message}</p>
        </div>
        <div className='grid grid-cols-2 gap-2 w-150'>
            {
                groups.map((group) => (
                    <Link key={group._id} to={`/chat/group/${group._id}`}>
                        <div className='flex flex-row items-center gap-2 justify-between bg-[#DCDCDD] p-2'>
                            <img src={groupIcon} width={24} />
                            <h1>{group.name}</h1>
                            <p className='text-green-600'>● {group.activeUsers}</p>
                        </div>
                    </Link>
                ))
            }
        </div>
    </div>
  )
}

export default TopGroups