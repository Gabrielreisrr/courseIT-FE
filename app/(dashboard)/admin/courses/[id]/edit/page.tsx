"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { coursesApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      setFetching(true);
      const response = await coursesApi.getCourseById(id);
      if (response.data) {
        setTitle(response.data.title || "");
        setDescription(response.data.description || "");
        setImageUrl(response.data.imageUrl || "");
      } else {
        setError("Course not found");
      }
      setFetching(false);
    };
    if (id) fetchCourse();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const response = await coursesApi.updateCourse(id, {
      title,
      description,
      imageUrl,
    });
    setLoading(false);
    if (response.error) {
      setError(response.error);
    } else {
      router.push("/admin/courses");
    }
  };

  if (fetching) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Edit Course</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <Input
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <Input
          placeholder="Image URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </div>
  );
}
