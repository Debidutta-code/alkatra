import React from "react";
import Breadcrumbs from "../../../components/ui/breadcrumbs";
import ProfileForm from "./profile-form";

type Props = {};

export default function Profile({}: Props) {
  const data = {
    firstname: "Ritesh",
    lastname: "Behera",
    email: "riteshbehera888@gmail.com",
  };

  return (
    <>
      <ProfileForm data={data} />
    </>
  );
}
