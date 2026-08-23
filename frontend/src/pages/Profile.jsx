import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { User, Phone, Mail, MapPin, Key, Plus, Trash2 } from 'lucide-react';
import { updateProfile, clearError } from '../store/slices/authSlice.js';

const Profile = () => {
  const dispatch = useDispatch();

  const { userInfo, loading, error, success } = useSelector((state) => state.auth);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updateError, setUpdateError] = useState('');

  // Address form states
  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  });
  const [showAddressForm, setShowAddressForm] = useState(false);

  useEffect(() => {
    if (userInfo) {
      setName(userInfo.name || '');
      setPhone(userInfo.phone || '');
      setAddresses(userInfo.addresses || []);
    }
    return () => {
      dispatch(clearError());
    };
  }, [userInfo, dispatch]);

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setUpdateError('');

    if (password && password !== confirmPassword) {
      setUpdateError('Passwords do not match');
      return;
    }

    const payload = { name, phone };
    if (password) payload.password = password;

    dispatch(updateProfile(payload));
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.zipCode) {
      alert('Please fill in all address fields.');
      return;
    }

    // Set first address as default
    const isDefault = addresses.length === 0;
    const updatedAddresses = [...addresses, { ...newAddress, isDefault }];
    
    setAddresses(updatedAddresses);
    dispatch(updateProfile({ address: updatedAddresses }));
    
    // Reset form
    setNewAddress({ street: '', city: '', state: '', zipCode: '', country: 'India' });
    setShowAddressForm(false);
  };

  const handleRemoveAddress = (addrId) => {
    const updatedAddresses = addresses.filter(addr => addr._id !== addrId);
    setAddresses(updatedAddresses);
    dispatch(updateProfile({ address: updatedAddresses }));
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white">Account Settings</h1>
        <p className="text-xs text-slate-400 mt-1">Manage profile, password updates, and shipping destinations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Profile Form & Credentials */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass rounded-2xl p-6 border border-slate-900 space-y-6">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" /> Basic Details
            </h2>

            {success && (
              <p className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl">
                Profile updated successfully!
              </p>
            )}

            {(error || updateError) && (
              <p className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 p-2.5 rounded-xl">
                {error || updateError}
              </p>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Email Address (Non-editable)</label>
                  <input
                    type="email"
                    disabled
                    value={userInfo?.email || ''}
                    className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3.5 py-2 text-xs text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-900 space-y-4">
                <h3 className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <Key className="w-4.5 h-4.5 text-blue-400" /> Update Password (Optional)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">New Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Leave blank to keep current"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400">Confirm Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="glow-btn bg-blue-600 hover:bg-blue-500 text-white font-bold h-11 px-6 rounded-xl text-xs transition-colors"
              >
                {loading ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Address management */}
        <div className="space-y-6">
          <div className="glass rounded-2xl p-6 border border-slate-900 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-900 pb-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-400" /> Saved Destinations
              </h2>
              <button
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="text-xs bg-slate-900 hover:bg-slate-850 p-1.5 rounded-lg border border-slate-800 text-slate-300 hover:text-white"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Address List */}
            {addresses.length > 0 ? (
              <div className="space-y-3.5">
                {addresses.map((addr) => (
                  <div key={addr._id} className="relative glass border border-slate-900 rounded-xl p-4 space-y-1 text-xs">
                    {addr.isDefault && (
                      <span className="absolute top-3 right-3 text-[9px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded">
                        Default
                      </span>
                    )}
                    <p className="font-semibold text-slate-200">{addr.street}</p>
                    <p className="text-slate-400">{addr.city}, {addr.state} - {addr.zipCode}</p>
                    <p className="text-slate-500">{addr.country}</p>

                    <button
                      onClick={() => handleRemoveAddress(addr._id)}
                      className="text-red-400 hover:text-red-300 font-semibold text-[10px] mt-2 flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove Address
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              !showAddressForm && (
                <div className="text-center py-6 text-slate-500 text-xs">
                  No addresses saved yet. Click the + button above to add one.
                </div>
              )
            )}

            {/* Address addition form */}
            {showAddressForm && (
              <form onSubmit={handleAddAddress} className="space-y-4 pt-3 border-t border-slate-900 animate-in slide-in-from-top duration-250">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">New Shipping Destination</h3>

                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-400">Street Address</label>
                    <input
                      type="text"
                      required
                      value={newAddress.street}
                      onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                      placeholder="e.g. 101, Main Road"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-slate-400">City</label>
                      <input
                        type="text"
                        required
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        placeholder="City"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-400">State</label>
                      <input
                        type="text"
                        required
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                        placeholder="State"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400">ZIP Code</label>
                    <input
                      type="text"
                      required
                      value={newAddress.zipCode}
                      onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                      placeholder="ZIP Code"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="w-1/2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 font-bold py-2 rounded-lg text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-xs"
                  >
                    Save Destination
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
