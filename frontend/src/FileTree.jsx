import React from 'react';

export default function FileTree({ files }) {
  if (!files || files.length === 0) {
    return <p>No files found.</p>;
  }

  return (
    <div className="filetree">
      <ul>
        {files.map((item) => (
          <li key={item.sha} className={`filetree-item ${item.type}`}>
            <span>{item.path}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

