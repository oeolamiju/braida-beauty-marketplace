import { useParams } from "react-router-dom";
import ServiceForm from "@/components/ServiceForm";

export default function ServiceEdit() {
  const { id } = useParams<{ id: string }>();
  
  return <ServiceForm mode="edit" serviceId={parseInt(id!)} />;
}
