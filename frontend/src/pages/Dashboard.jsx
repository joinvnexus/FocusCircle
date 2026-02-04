import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { Plus, Trash2, CheckCircle, Circle } from 'lucide-react';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');

  const fetchTasks = async () => {
    try {
      const { data } = await api.get('/tasks');
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks', error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', { title, description, priority, dueDate });
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
      fetchTasks();
    } catch (error) {
      console.error('Error adding task', error);
    }
  };

  const toggleStatus = async (task) => {
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    try {
      await api.put(`/tasks/${task._id}`, { status: newStatus });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task', error);
    }
  };

  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Tasks</h1>

        <form onSubmit={handleAddTask} className="bg-white p-6 rounded-lg shadow-sm mb-8 border">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Task title"
              className="w-full p-2 border rounded"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <textarea
              placeholder="Description (optional)"
              className="w-full p-2 border rounded"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="priority" className="block text-sm text-gray-700 mb-1">Priority</label>
              <select
                id="priority"
                className="w-full p-2 border rounded"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label htmlFor="dueDate" className="block text-sm text-gray-700 mb-1">Due Date</label>
              <input
                id="dueDate"
                type="date"
                className="w-full p-2 border rounded"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
          <button type="submit" className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            <Plus className="h-5 w-5 mr-2" /> Add Task
          </button>
        </form>

        <div className="space-y-4">
          {tasks.length === 0 && <p className="text-gray-500 text-center py-4">No tasks yet. Start by adding one!</p>}
          {tasks.map((task) => (
            <div key={task._id} className="bg-white p-4 rounded-lg shadow-sm border flex justify-between items-center">
              <div className="flex items-center">
                <button onClick={() => toggleStatus(task)} className="mr-4 text-blue-600">
                  {task.status === 'completed' ? <CheckCircle className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                </button>
                <div>
                  <h3 className={`text-lg font-medium ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                    {task.title}
                  </h3>
                  <p className="text-sm text-gray-500">{task.description}</p>
                  <div className="flex space-x-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase ${
                      task.priority === 'high' ? 'bg-red-100 text-red-700' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {task.priority}
                    </span>
                    {task.dueDate && (
                      <span className="text-xs text-gray-400">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button onClick={() => deleteTask(task._id)} className="text-red-500 hover:text-red-700">
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
