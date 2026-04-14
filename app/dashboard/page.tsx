"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

type Activity = {
  id: number;
  distance: number;
  moving_time: number;
  start_date: string;
};

export default function Dashboard() {
  const [data, setData] = useState<Activity[]>([]);

  useEffect(() => {
    fetch("/api/strava")
      .then((res) => res.json())
      .then((activities) => {
        const formatted = activities.map((a: Activity) => ({
          date: new Date(a.start_date).toLocaleDateString(),
          distance: a.distance / 1000, // km
          time: a.moving_time / 60, // minutes
        }));

        setData(formatted);
      });
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">
        Strava Activities
      </h1>

      <LineChart width={600} height={300} data={data}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="distance" />
      </LineChart>
    </div>
  );
}