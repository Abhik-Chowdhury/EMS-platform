import React, { useEffect, useRef, useState } from 'react'
import { navbarStyles as s } from '../assets/dummyStyles';
import { LayoutDashboard, CalendarCheck, FileText, Send, BriefcaseBusiness, LogOut, X, Menu } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
const tabs = [
    ["Dashboard", "/", LayoutDashboard],
    ["Attendance", "/attendance", CalendarCheck],
    ["Payslip", "/payslip", FileText],
    ["Leave", "/leave", Send],
];
const Navbar = ({ onLogout }) => {
    const [menuOpen, setMenuOpen] = useState();
    const menuRef = useRef(null);
    const location = useLocation();

    //to collaps the menu for mobile view if click outsid the box
    // or click the escape key

    useEffect(() => {
        if (!menuOpen) return undefined;

        const closeOnOutsideClick = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };
        const closeOnEscape = (event) => {
            if (event.key === "Escape") setMenuOpen(false);
        };

        document.addEventListener("mousedown", closeOnOutsideClick);
        document.addEventListener("touchstart", closeOnOutsideClick);
        document.addEventListener("keydown", closeOnEscape);

        return () => {
            document.removeEventListener("mousedown", closeOnOutsideClick);
            document.removeEventListener("touchstart", closeOnOutsideClick);
            document.removeEventListener("keydown", closeOnEscape);
        };
    }, [menuOpen]);


    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname]);

    // logout
    const handleLogout = () => {
        setMenuOpen(false);
        onLogout();
    }
    return (
        <header ref={menuRef} className={s.header}>
            <div className={s.container}>
                <Link to="/" onClick={() => setMenuOpen(false)} className={s.logoLink}>
                    <span className={s.logoIconWrapper}>
                        <BriefcaseBusiness className={s.logoIcon} />
                    </span>
                    <span className={s.logoTextWrapper}>
                        <b className={s.logoText}>Employee Panel</b>
                        <span className={s.logoSubtext}>Employee System</span>
                    </span>
                </Link>

                {/* main nav items */}
                <nav className={s.desktopNav}>
                    {tabs.map(([label, href, Icon]) => (
                        <NavLink
                            key={label}
                            to={href}
                            end={href === '/'
                            }
                            className={({ isActive }) => s.getDesktopNavLinkClass(isActive)}
                        >
                            <Icon size={17} />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                {/* logout item */}
                <div className={s.actionWrapper}>
                    <button onClick={handleLogout} className={s.logoutDesktop}>
                        <LogOut size={17} />
                        Logout
                    </button>

                    {/* mobile view sectoion */}
                    <button type="button"
                        onClick={() => setMenuOpen((open) => !open)}
                        className={s.menuToggle}
                    >
                        {menuOpen ? <X size={20} /> : <Menu size={20} />}

                    </button>
                </div>

                {/* mobile navbar */}

                <nav
                    className={`${s.mobileNavBase} ${menuOpen ? s.mobileNavOpen : s.mobileNavClosed}`}
                >
                    {/* nav bar items mobile */}
                    {tabs.map(([label, href, Icon]) => (
                        <NavLink
                            key={label}
                            to={href}
                            end={href === '/'}
                            onClick={() => setMenuOpen(false)}
                            className={({ isActive }) => s.getMobileNavLinkClass(isActive)}
                        >
                            <Icon size={17} />
                            {label}

                        </NavLink>
                    ))}

                    <button onClick={handleLogout} className={s.logoutMobile}>
                        <LogOut size={17} />
                        Logout
                    </button>

                </nav>
            </div>
        </header>
    )
}

export default Navbar