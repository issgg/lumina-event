import { motion } from "framer-motion";
import { contenidoCapa } from "../movimiento.js";

export default function Pagina({ children, className = "", ref, ...props }) {
  return (
    <motion.section ref={ref} className={`pagina ${className}`.trim()} variants={contenidoCapa} {...props}>
      {children}
    </motion.section>
  );
}
