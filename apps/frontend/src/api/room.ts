
import axios  from './axios';


// Join room
export const joinRoom = async (roomId: string, userId: string): Promise<void> => {
    axios.get(`/room/${roomId}/join`, { params: { userId } });
};

// Create room
