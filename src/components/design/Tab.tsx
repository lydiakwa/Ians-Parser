import classNames from "classnames";
import type React from "react";
import { createContext, useContext, useState } from "react";

type ContextType = [
  string | null,
  React.Dispatch<React.SetStateAction<string | null>>
];

const ActiveTabContext = createContext<ContextType>(
  [] as unknown as ContextType
);

function Tab({
  children,
  activeTab: initialActiveTab,
}: {
  children: React.ReactElement | React.ReactElement[];
  activeTab?: string;
}) {
  const [activeTab, setActiveTab] = useState<string | null>(
    initialActiveTab || null
  );

  return (
    <ActiveTabContext.Provider value={[activeTab, setActiveTab]}>
      <div role="tablist" className="tabs tabs-border">
        {children}
      </div>
    </ActiveTabContext.Provider>
  );
}

function TabLink({ id, title }: { id: string; title: string }) {
  const [activeTab, setActiveTab] = useContext(ActiveTabContext);

  return (
    <button
      role="tab"
      className={classNames("tab text-white", {
        "tab-active": id === activeTab,
      })}
      onClick={() => setActiveTab(id)}
    >
      {title}
    </button>
  );
}

function TabContent({
  children,
  id,
}: {
  children: React.ReactElement | React.ReactElement[];
  id: string;
}) {
  const [activeTab] = useContext(ActiveTabContext);

  return (
    <div
      className={classNames("tab-content border-base-300 bg-base-100 p-10", {
        hidden: activeTab !== id,
      })}
    >
      {children}
    </div>
  );
}

Tab.Link = TabLink;
Tab.Content = TabContent;

export default Tab;
