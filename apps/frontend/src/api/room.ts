
import axios from './axios';


// Get room
const getRoomID = async (slug: string) => {
    const response = await axios.get(`/room/${slug}/`);
    return response.data.id;
};

// Join room
const joinRoom = async (slug: string) => {
    const roomId = await getRoomID(slug);
    return roomId;
}

// Create room


export { joinRoom}