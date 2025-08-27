import { motion } from "motion/react";
import { IconCircle, IconCircleFill } from "../../Icon";

export default function CircleSelect({
  active = false,
  ...rest
}: { active?: boolean } & React.HTMLAttributes<SVGElement>) {
  return (
    <>
      {active && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <IconCircleFill {...rest} />
        </motion.div>
      )}
      {!active && <IconCircle {...rest} />}
    </>
  );
}
