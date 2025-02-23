import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../utils/api';

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
      formData.append('avatar', avatar, avatar.name); // Added filename explicitly

      console.log('Uploading file:', {
        name: avatar.name,
        type: avatar.type,
        size: avatar.size
      });

      const response = await userService.updateAvatar(formData);
      
      if (response.data?.data) {
        setAvatar(null);
        // Update user state with new avatar URL
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
    
    // Validate passwords
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

      // Reset form and show success
      setPasswordForm({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setIsChangingPassword(false);
      // You might want to add a success message here
    } catch (error) {
      setPasswordError(error.response?.data?.message || 'Failed to change password');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await userService.updateAccount(formData);
      setIsEditing(false);
      loadUserData();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (!user) return <div>Loading...</div>;

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
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative">
            <img
              src={user.avatar || 'default-avatar.png'}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover"
            />
            {isEditing && (
              <div className="mt-2">
                <input
                  type="file"
                  name="avatar"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="text-sm"
                  // Add max file size hint
                  data-maxsize="5242880" // 5MB in bytes
                />
                <button
                  onClick={handleAvatarUpdate}
                  className="mt-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  Update Avatar
                </button>
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>

        {!isEditing ? (
          <div className="space-y-4">
            <div>
              <p className="text-gray-600">Phone</p>
              <p className="font-medium">{user.phone}</p>
            </div>
            <div>
              <p className="text-gray-600">Address</p>
              <p className="font-medium">{user.address || 'No address provided'}</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Edit Profile
              </button>
              <button
                onClick={() => setIsChangingPassword(true)}
                className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
              >
                Change Password
              </button>
              <button
                onClick={() => navigate('/wishlist')}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                View Wishlist
              </button>
              <button
                onClick={() => navigate('/orders')}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Order History
              </button>
            </div>
            {/* Show password form when isChangingPassword is true */}
            {isChangingPassword && passwordChangeForm}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full border rounded p-2"
              />
            </div>
            <div>
              <label className="block text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full border rounded p-2"
              />
            </div>
            <div>
              <label className="block text-gray-700">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full border rounded p-2"
              />
            </div>
            <div>
              <label className="block text-gray-700">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full border rounded p-2"
                rows="3"
              />
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
            {isChangingPassword && passwordChangeForm}
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;
