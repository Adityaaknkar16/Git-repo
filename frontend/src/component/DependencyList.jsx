import React from 'react';

const DependencyList = ({ dependencies }) => {
  const dependencyNames = Object.keys(dependencies);

  if (dependencyNames.length === 0) {
    return <p>No <code>package.json</code> dependencies found.</p>;
  }

  return (
    <div className="dependency-grid">
      {dependencyNames.map((name) => (
        <div key={name} className="dependency-item" title={`Version: ${dependencies[name]}`}>
          {name}
        </div>
      ))}
    </div>
  );
};
export default DependencyList;