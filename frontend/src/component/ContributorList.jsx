import React from 'react';
import './ContributorList.css'; // We'll add this CSS file next

const ContributorList = ({ contributors }) => {
  return (
    <div className="contributor-list">
      {contributors.map(user => (
        <a href={`https://github.com/${user.login}`} target="_blank" rel="noopener noreferrer" key={user.login} className="contributor-item" title={`${user.login} (${user.contributions} contributions)`}>
          <img src={user.avatar_url} alt={`${user.login}'s avatar`} className="contributor-avatar" />
          <span className="contributor-login">{user.login}</span>
        </a>
      ))}
    </div>
  );
};
export default ContributorList;