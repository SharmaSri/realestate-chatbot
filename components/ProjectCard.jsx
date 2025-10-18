export default function ProjectCard({ project }) {
  return (
    <div style={{ border: "1px solid #ccc", padding: "10px", margin: "10px 0" }}>
      <h3>{project.ProjectName}</h3>
      <p>City: {project.City}</p>
      <p>Price: {project.Price}</p>
    </div>
  );
}
