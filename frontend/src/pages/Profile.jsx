import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [avatar, setAvatar] = useState(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const notifySuccess = (message) => toast.success(message);
  const notifyError = (message) => toast.error(message);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const response = await userService.getCurrentUser();
      const userData = response.data.data.user;
      setUser(userData);
      setFormData({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        address: userData.address || ''
      });
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAvatarChange = (e) => {
    setAvatar(e.target.files[0]);
  };

  const handleAvatarUpdate = async () => {
    if (!avatar) {
      console.error('No avatar file selected');
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('avatar', avatar, avatar.name);

      console.log('Uploading file:', {
        name: avatar.name,
        type: avatar.type,
        size: avatar.size
      });

      const response = await userService.updateAvatar(formData);
      
      if (response.data?.data) {
        setAvatar(null);
        setUser(prevUser => ({
          ...prevUser,
          avatar: response.data.data.avatar
        }));
      }
    } catch (error) {
      console.error('Error updating avatar:', {
        message: error.response?.data?.message,
        status: error.response?.status,
        data: error.response?.data
      });
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value
    });
    setPasswordError('');
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords don't match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      return;
    }

    try {
      await userService.changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      });

      setPasswordForm({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setIsChangingPassword(false);
    } catch (error) {
      setPasswordError(error.response?.data?.message || 'Failed to change password');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await userService.updateAccount(formData);
      setIsEditing(false);
      await loadUserData();
      notifySuccess('Profile updated successfully!');
    } catch (error) {
      notifyError(error.response?.data?.message || 'Error updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  const passwordChangeForm = (
    <div className="mt-6 border-t pt-6">
      <h3 className="text-lg font-semibold mb-4">Change Password</h3>
      <form onSubmit={handlePasswordSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700">Current Password</label>
          <input
            type="password"
            name="oldPassword"
            value={passwordForm.oldPassword}
            onChange={handlePasswordChange}
            className="w-full border rounded p-2"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700">New Password</label>
          <input
            type="password"
            name="newPassword"
            value={passwordForm.newPassword}
            onChange={handlePasswordChange}
            className="w-full border rounded p-2"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700">Confirm New Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={passwordForm.confirmPassword}
            onChange={handlePasswordChange}
            className="w-full border rounded p-2"
            required
          />
        </div>
        {passwordError && (
          <p className="text-red-500 text-sm">{passwordError}</p>
        )}
        <div className="flex space-x-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Update Password
          </button>
          <button
            type="button"
            onClick={() => {
              setIsChangingPassword(false);
              setPasswordError('');
              setPasswordForm({
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
              });
            }}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <img
                    src={user.avatar || 'default-avatar.png'}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover ring-4 ring-tertiary"
                  />
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full shadow-lg cursor-pointer hover:bg-blue-600 transition-colors">
                      <input
                        type="file"
                        name="avatar"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      </svg>
                    </label>
                  )}
                </div>
                <h2 className="mt-4 text-2xl font-bold text-gray-900">{user.name}</h2>
                <p className="text-gray-500">{user.email}</p>
                
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="mt-6 inline-flex items-center px-4 py-2 border border-tertiary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit Profile
                  </button>
                )}
              </div>

              {/* Quick Actions */}
              <div className="mt-8 space-y-3">
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="w-full flex items-center p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  Change Password
                </button>
                <button
                  onClick={() => navigate('/wishlist')}
                  className="w-full flex items-center p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Wishlist
                </button>
                <button
                  onClick={() => navigate('/orders')}
                  className="w-full flex items-center p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Order History
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Details/Edit Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              {!isEditing ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="mt-1 font-medium text-gray-900">{user.phone}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="mt-1 font-medium text-gray-900">{user.email}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg md:col-span-2">
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="mt-1 font-medium text-gray-900">{user.address || 'No address provided'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Profile</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal - Keep existing modal code */}
      <AnimatePresence>
        {isChangingPassword && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full"
            >
              {passwordChangeForm}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default Profile;
