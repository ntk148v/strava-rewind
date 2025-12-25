"use client";

import { YearStats } from "@/types";

interface FunFact {
  icon: string;
  fact: string;
  highlight: string;
}

interface FunFactsProps {
  stats: YearStats;
}

const CITY_DISTANCES = [
  { from: "Paris", to: "London", distance: 344000, emoji: "🇫🇷→🇬🇧" },
  { from: "New York", to: "Boston", distance: 346000, emoji: "🗽→🏛️" },
  {
    from: "Los Angeles",
    to: "San Francisco",
    distance: 617000,
    emoji: "🌴→🌁",
  },
  { from: "Tokyo", to: "Osaka", distance: 515000, emoji: "🗼→🏯" },
  { from: "Sydney", to: "Melbourne", distance: 878000, emoji: "🦘" },
];

function generateFunFacts(stats: YearStats): FunFact[] {
  const facts: FunFact[] = [];
  const totalDistance = stats.totalDistance;
  const totalElevation = stats.totalElevation;
  const totalTime = stats.totalTime;

  // Distance comparisons
  const footballFields = Math.round(totalDistance / 100);
  if (footballFields >= 10) {
    facts.push({
      icon: "🏈",
      fact: `You covered the length of ${footballFields.toLocaleString()} football fields`,
      highlight: `${footballFields.toLocaleString()} fields`,
    });
  }

  const marathons = totalDistance / 42195;
  if (marathons >= 1) {
    facts.push({
      icon: "🏃",
      fact: `You ran the equivalent of ${marathons.toFixed(1)} marathons`,
      highlight: `${marathons.toFixed(1)} marathons`,
    });
  }

  // City distance comparisons
  for (const city of CITY_DISTANCES) {
    const times = totalDistance / city.distance;
    if (times >= 0.5 && times <= 10) {
      const qualifier =
        times >= 1
          ? `${times.toFixed(1)}x`
          : `${Math.round(times * 100)}% of the way`;
      facts.push({
        icon: city.emoji,
        fact: `You could have traveled from ${city.from} to ${city.to} ${qualifier}`,
        highlight: `${city.from} to ${city.to}`,
      });
      break;
    }
  }

  // Elevation comparisons
  const everests = totalElevation / 8848;
  if (everests >= 0.5) {
    facts.push({
      icon: "🏔️",
      fact: `You climbed the equivalent of ${everests.toFixed(
        1
      )}x Mount Everest`,
      highlight: `${everests.toFixed(1)}x Everest`,
    });
  }

  const eiffelTowers = totalElevation / 324;
  if (eiffelTowers >= 5) {
    facts.push({
      icon: "🗼",
      fact: `You could have climbed the Eiffel Tower ${Math.round(
        eiffelTowers
      )} times`,
      highlight: `${Math.round(eiffelTowers)} Eiffel Towers`,
    });
  }

  // Time comparisons
  const hours = totalTime / 3600;
  const days = hours / 24;

  if (days >= 1) {
    facts.push({
      icon: "⏰",
      fact: `You spent ${days.toFixed(1)} full days exercising`,
      highlight: `${days.toFixed(1)} days`,
    });
  }

  const movies = hours / 2;
  if (movies >= 10) {
    facts.push({
      icon: "🎬",
      fact: `Instead of exercising, you could've watched ${Math.round(
        movies
      )} movies`,
      highlight: `${Math.round(movies)} movies`,
    });
  }

  // Calories (rough estimate: 500 cal/hour average)
  const calories = hours * 500;
  const pizzas = calories / 2000;
  if (pizzas >= 10) {
    facts.push({
      icon: "🍕",
      fact: `You burned approximately ${Math.round(
        pizzas
      )} pizzas worth of calories`,
      highlight: `${Math.round(pizzas)} pizzas`,
    });
  }

  // Activity frequency
  const activitiesPerWeek = stats.totalActivities / 52;
  if (activitiesPerWeek >= 3) {
    facts.push({
      icon: "📅",
      fact: `You averaged ${activitiesPerWeek.toFixed(1)} activities per week`,
      highlight: `${activitiesPerWeek.toFixed(1)} per week`,
    });
  }

  return facts.slice(0, 6);
}

export default function FunFacts({ stats }: FunFactsProps) {
  const facts = generateFunFacts(stats);

  if (facts.length === 0) return null;

  return (
    <div className="grid sm:grid-cols-2 gap-4 stat-card">
      {facts.map((fact, index) => (
        <div key={index} className="flex items-start gap-3">
          <span className="text-2xl">{fact.icon}</span>
          <p className="text-sm text-zinc-300">{fact.fact}</p>
        </div>
      ))}
    </div>
  );
}
