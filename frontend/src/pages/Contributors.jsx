import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import NeeleshJain from "@/assets/contributors/Neelesh Jain.jpg";
import PrinceKumar from "@/assets/contributors/Prince Kumar.jpg";
import AkshatJain from "@/assets/contributors/Akshat Jain.jpg";
import AryanAgrawal from "@/assets/contributors/Aryan Agrawal.jpg";
import DurvaJain from "@/assets/contributors/Durva Jain.jpg";
import LavanyaJain from "@/assets/contributors/Lavanya Jain.jpg";
import MohammedLakhrawala from "@/assets/contributors/Mohammed Lakhrawala.jpg";
import AbhishekSinghChauhan from "@/assets/contributors/Abhishek Singh Chauhan.jpg";
import AtharavChopda from "@/assets/contributors/Atharav Chopda.jpg";
import HarshitaPandey from "@/assets/contributors/Harshita Pandey.jpg";

const head = {
  name: "Neelesh Jain",
  role: "Mentor",
  image: NeeleshJain,
  imageClassName: "object-cover object-top",
};

const manager = {
  name: "Prince Kumar",
  role: "Project Manager",
  image: PrinceKumar,
};

const developers = [
  {
    name: "Mohammed Lakhrawala",
    role: "Developer",
    image: MohammedLakhrawala,
  },
  {
    name: "Harshita Pandey",
    role: "Developer",
    image: HarshitaPandey,
    initials: "HP",
  },
  {
    name: "Akshat Jain",
    role: "Developer",
    image: AkshatJain,
  },
  {
    name: "Aryan Agrawal",
    role: "Developer",
    image: AryanAgrawal,
  },
  {
    name: "Lavanya Jain",
    role: "Developer",
    image: LavanyaJain,
  },
  {
    name: "Abhishek Singh",
    role: "Developer",
    image: AbhishekSinghChauhan,
  },
  {
    name: "Durva Jain",
    role: "Developer",
    image: DurvaJain,
  },
  {
    name: "Atharav Chopda",
    role: "Developer",
    image: AtharavChopda,
  },
  {
    name: "Shaurya Mishra",
    role: "Developer",
    initials: "SM",
  },
];

const ContributorCard = ({ person }) => {
  return (
    <Card className="h-full shadow-elegant">
      <CardContent className="pt-6 flex flex-col items-center text-center gap-3">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-primary flex items-center justify-center">
          {person.image ? (
            <img
              src={person.image}
              alt={person.name}
              className={`w-full h-full object-cover ${person.imageClassName || ""}`}
            />
          ) : (
            <span className="text-lg font-semibold text-primary-foreground">
              {person.initials || person.name.charAt(0)}
            </span>
          )}
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold leading-tight">{person.name}</h3>
          <p className="text-sm text-muted-foreground">{person.role}</p>
        </div>
      </CardContent>
    </Card>
  );
};

const Contributors = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-4">
          <p className="text-sm font-semibold tracking-wide text-primary uppercase">
            Team
          </p>
          <h1 className="text-4xl md:text-5xl font-bold">Project Contributors</h1>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            A quick look at the people who led and built this project.
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-center">Head</h2>
          <div className="flex justify-center">
            <div className="max-w-sm w-full">
              <ContributorCard person={head} />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-center">Project Manager</h2>
          <div className="flex justify-center">
            <div className="max-w-sm w-full">
              <ContributorCard person={manager} />
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-center">Developers</h2>
            <p className="text-muted-foreground text-center">
              The builders who brought the platform to life.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {developers.map((dev) => (
              <ContributorCard key={dev.name} person={dev} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Contributors;
