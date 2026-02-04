import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import CommentSection from '../components/CommentSection';
import { Plus, MessageSquare, UserPlus, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CommunityDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [community, setCommunity] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isMember, setIsMember] = useState(false);
  const [newPriority, setNewPriority] = useState('medium');
  const [expandedTask, setExpandedTask] = useState(null);

  const fetchCommunity = async () => {
    try {
      const { data } = await api.get(`/communities/${id}`);
      setCommunity(data);
      setIsMember(data.members.some(m => m._id === user._id));
    } catch (error) {
      console.error('Error fetching community', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const { data } = await api.get(`/tasks?communityId=${id}`);
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks', error);
    }
  };

  useEffect(() => {
    fetchCommunity();
    fetchTasks();
  }, [id, user]);

  const handleJoin = async () => {
    try {
      await api.post(`/communities/${id}/join`);
      fetchCommunity();
    } catch (error) {
      console.error('Error joining community', error);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', {
        title: newTaskTitle,
        community: id,
        priority: newPriority
      });
      setNewTaskTitle('');
      setNewPriority('medium');
      fetchTasks();
    } catch (error) {
      console.error('Error adding community task', error);
    }
  };

  if (!community) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="bg-white p-8 rounded-lg shadow-sm border mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{community.name}</h1>
            <p className="text-gray-600 mb-4">{community.description}</p>
            <div className="flex space-x-4 text-sm text-gray-500">
              <span>Owner: {community.owner.name}</span>
              <span>•</span>
              <span>{community.members.length} Members</span>
            </div>
          </div>
          {!isMember && (
            <button
              onClick={handleJoin}
              className="flex items-center bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-medium"
            >
              <UserPlus className="h-5 w-5 mr-2" /> Join Community
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-4">Shared Tasks</h2>
            {isMember && (
              <form onSubmit={handleAddTask} className="bg-white p-4 rounded-lg shadow-sm border mb-6">
                <div className="flex">
                  <input
                    type="text"
                    placeholder="Share a new task..."
                    className="flex-grow p-2 border rounded-l focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    required
                  />
                  <select
                    className="p-2 border-t border-b border-r focus:outline-none"
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700">
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-4">
              {tasks.length === 0 && <p className="text-gray-500">No shared tasks yet.</p>}
              {tasks.map((task) => (
                <div key={task._id} className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm text-gray-500">Posted by {task.user.name}</p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                          task.priority === 'high' ? 'bg-red-100 text-red-700' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setExpandedTask(expandedTask === task._id ? null : task._id)}
                      className="flex items-center text-gray-400 hover:text-blue-600"
                    >
                      <MessageSquare className="h-5 w-5 mr-1" />
                      {expandedTask === task._id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                  {expandedTask === task._id && (
                    <CommentSection taskId={task._id} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Members</h2>
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <ul className="divide-y divide-gray-100">
                {community.members.map((member) => (
                  <li key={member._id} className="py-3 flex items-center">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3">
                      {member.name[0]}
                    </div>
                    <span className="text-gray-900">{member.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityDetail;
