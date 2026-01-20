import { useEffect } from "react";
import { BoronIcon } from "../svg-icons/boron-icon";
import { HeliumIcon } from "../svg-icons/helium-icon";
import { HydrogenIcon } from "../svg-icons/hydrogen-icon";

const layouts = [
  { text: "hydrogen", icon: <HydrogenIcon /> },
  { text: "helium", icon: <HeliumIcon /> },
  { text: "boron", icon: <BoronIcon /> },
];

const DEFAULT_LAYOUT = "helium"; // Ganti sesuai layout default yang diinginkan

const ThemeLayout = () => {
  // Set layout global sekali saja, tidak bisa diubah user
  useEffect(() => {
    document.documentElement.setAttribute("layout", DEFAULT_LAYOUT);
  }, []);

  return (
    <div className="theme-setting-item">
      <h6 className="font-medium text-base mb-3">Theme Layout</h6>
      <div className="grid grid-cols-3 gap-4">
        {layouts.map((item, index) => (
          <div className="" key={index}>
            <div
              className={`border border-neutral-300 flex items-center justify-center h-[92px] rounded-md ring-2 dark:border-slate-500
                ${
                  DEFAULT_LAYOUT === item.text
                    ? "ring-primary text-primary dark:text-primary"
                    : "ring-transparent text-neutral-500 dark:text-white"
                }`}
            >
              {item.icon}
            </div>
            <h6
              className={`text-center capitalize text-sm font-medium pt-2
                ${
                  DEFAULT_LAYOUT === item.text
                    ? "text-primary dark:text-primary"
                    : "text-neutral-500 dark:text-neutral-200"
                }`}
            >
              {item.text}
            </h6>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThemeLayout;
