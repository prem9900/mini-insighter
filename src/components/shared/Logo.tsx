import Link from "next/link";

interface LogoProps {
    size?: number;
    className?: string;
    showText?: boolean;
}

export default function Logo({ size = 40, className = "", showText = false }: LogoProps) {
    return (
        <Link href="/" className={`flex items-center gap-3 ${className}`}>
            <div
                className="relative flex items-center justify-center rounded-2xl gradient-google-multi shadow-lg transition-transform hover:scale-105"
                style={{ width: size, height: size }}
            >
                <span className="text-white font-bold select-none" style={{ fontSize: size * 0.5 }}>✨</span>
            </div>
            {showText && (
                <span className="font-heading font-bold text-2xl tracking-tight text-gray-900">
                    Mini Insighter
                </span>
            )}
        </Link>
    );
}
