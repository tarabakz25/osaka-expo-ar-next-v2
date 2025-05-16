import { useState } from "react";
import { projects } from "@/data/projects";
import type { Project } from "@/types/project";

export default function Message() {
  const [name, setName] = useState("");
  const [project, setProject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const res = await fetch("/api/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, project, message }),
    });

    const json = await res.json();
    if (json.message === "Success") {
      alert("送信しました");
    } else {
      alert("送信に失敗しました");
      console.error("Error:", json.message);
    }
  }

  return (
    <div>
      <div>
        <h2>ご視聴ありがとうございました！良ければ、学生にメッセージをお願いいたします。</h2>
        <h2>Thank you for watching! Please, send a message to the students if you like.</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          <select name="project" id="project" value={project} onChange={(e) => setProject(e.target.value)}>
            {projects.map((p: Project) => (
              <option key={p.name} value={p.name}>{p.name}</option>
            ))}
          </select>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} />
          <button type="submit">送信</button>
        </form>
      </div>
    </div>
  )
}