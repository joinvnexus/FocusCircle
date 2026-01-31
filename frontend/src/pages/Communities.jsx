import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { Plus, Users } from 'lucide-react';

const Communities = () => {
  const [communities, setCommunities] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [showForm, setShowForm] = useState(false);

  const fetchCommunities = async () => {
    try {
      const { data } = await api.get('/communities');
      setCommunities(data);
    } catch (error) {
      console.error('Error fetching communities', error);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/communities', { name, description });
      setName('');
      setDescription('');
      setShowForm(false);
      fetchCommunities();
    } catch (error) {
      console.error('Error creating community', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Communities</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 mr-2" /> {showForm ? 'Cancel' : 'Create Community'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="bg-white p-6 rounded-lg shadow-sm mb-8 border max-w-lg mx-auto">
            <h2 className="text-xl font-bold mb-4">New Community</h2>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Community Name"
                className="w-full p-2 border rounded"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <textarea
                placeholder="Description"
                className="w-full p-2 border rounded"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
              Create
            </button>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communities.map((c) => (
            <div key={c._id} className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{c.name}</h3>
              <p className="text-gray-600 mb-4 h-12 overflow-hidden">{c.description}</p>
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <Users className="h-4 w-4 mr-1" />
                <span>{c.members.length} members</span>
              </div>
              <Link
                to={`/communities/${c._id}`}
                className="block text-center bg-gray-100 text-gray-700 py-2 rounded hover:bg-gray-200"
              >
                View Community
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Communities;
