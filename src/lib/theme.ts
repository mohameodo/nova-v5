export type Theme = 'default' | 'blacky';

export const themes = {
  default: {
    background: 'bg-[#1d1e20]',
    sidebar: 'bg-[#1d1e20]',
    card: 'bg-[#1d1e20]',
    border: 'border-gray-800',
    hover: 'hover:bg-gray-800/50',
  },
  blacky: {
    background: 'bg-black',
    sidebar: 'bg-black',
    card: 'bg-zinc-950',
    border: 'border-zinc-800',
    hover: 'hover:bg-zinc-900',
  },
};
