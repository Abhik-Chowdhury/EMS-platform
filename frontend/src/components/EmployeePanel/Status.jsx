import { statusStyles as s } from "../../assets/dummyStyles";

const Status = ({s: status}) => (
    <span className={s.getStatusClass(status)}>
        {status}
    </span>
);

export default Status;