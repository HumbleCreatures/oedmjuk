import { type NextPage } from "next";
import AppLayout from "../components/AppLayout";
import { UserFeed } from "../components/UserFeed";

const AppStart: NextPage = () => {
  
  return (
    <AppLayout>
     <UserFeed />
    </AppLayout>
  );
};

export default AppStart;
