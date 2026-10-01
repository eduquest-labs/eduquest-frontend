import { Card } from "@heroui/react";
import Image from "next/image";
import { Star } from "lucide-react";

type TestimonialCardProps = {
  name: string;
  role: string;
  quote: string;
  avatarSrc: string;
};

export function TestimonialCard({
  name,
  role,
  quote,
  avatarSrc,
}: TestimonialCardProps) {
  return (
    <Card
      role="article"
      className="h-full gap-5 border border-teal-950/10 bg-white p-6 shadow-[0_18px_50px_rgba(23,63,61,0.08)] dark:border-white/10 dark:bg-neutral-900"
    >
      <Card.Header className="flex-row items-center gap-3 p-0">
        <div className="relative size-12 shrink-0 overflow-hidden rounded-full bg-teal-100">
          <Image
            fill
            alt={`Avatar ilustratif ${name}`}
            className="object-cover"
            sizes="48px"
            src={avatarSrc}
          />
        </div>
        <div className="min-w-0">
          <Card.Title className="font-display text-base font-bold text-[#173f3d] dark:text-white">
            {name}
          </Card.Title>
          <Card.Description className="text-sm text-teal-900/60 dark:text-teal-100/60">
            {role}
          </Card.Description>
        </div>
      </Card.Header>
      <Card.Content className="gap-4 p-0">
        <div
          aria-label="Rating ilustratif: 5 dari 5 bintang"
          className="flex gap-1 text-accent"
          role="img"
        >
          {Array.from({ length: 5 }, (_, index) => (
            <Star aria-hidden="true" className="size-4 fill-current" key={index} />
          ))}
        </div>
        <blockquote className="text-sm leading-7 text-teal-950/75 dark:text-teal-50/75">
          “{quote}”
        </blockquote>
        <p className="text-[0.65rem] font-bold tracking-[0.13em] text-teal-700 uppercase dark:text-teal-300">
          Ilustrasi pengalaman — placeholder
        </p>
      </Card.Content>
    </Card>
  );
}
