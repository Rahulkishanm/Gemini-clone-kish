import React, { useEffect, useState } from 'react';
import "./userProfile.css";

function UserProfile({ user, onLogoutClicked }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  useEffect(()=>{
    setDropdownOpen(false)
  },[user])

  const handleProfileClick = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    // Add your logout logic here
    console.log('Logout clicked');
    onLogoutClicked()
  };

  return (
    <div className="user-profile">
      {user && (
        <><img
          src={user.photoURL}
          width="50"
          height="40"
          style={{ borderRadius: "50%" }}
          alt=""
          onClick={handleProfileClick}
        /><div className={`dropdown-menu ${dropdownOpen ? 'active' : ''}`}>
            <button onClick={handleLogout}>Logout</button>
          </div></>
      )}

    </div>
  );
}

export default UserProfile;
