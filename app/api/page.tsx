"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
} from "recharts";

export default function Dashboard() {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/posts")
      .then((res) => res.json())
      .then(setPosts);
  }, []);

  return (
    <div className="p-10">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-2xl font-bold"
      >
        Dashboard
      </motion.h1>

      <LineChart width={400} height={300} data={posts}>
        <XAxis dataKey="title" />
        <YAxis />
        <Line type="monotone" dataKey="id" />
      </LineChart>
    </div>
  );
}