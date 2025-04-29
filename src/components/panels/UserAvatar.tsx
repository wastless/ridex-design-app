import { Root as Avatar, Image as AvatarImage } from "~/components/ui/avatar";

const UserAvatar = ({
    name,
    color,
    image,
    className = "",
  }: {
    name: string;
    color?: string;
    image?: string | null;
    className?: string;
  }) => {
    // Map hex colors to Avatar color variants
    const getColorVariant = (hexColor: string) => {
      switch (hexColor) {
        case "#3B82F6": return "blue";
        case "#F59E0B": return "yellow";
        case "#8B5CF6": return "purple";
        case "#EC4899": return "red";
        case "#6366F1": return "sky";
        default: return "gray";
      }
    };

    return (
      <Avatar
        size="32"
        color={color ? getColorVariant(color) : "gray"}
        className={className}
      >
        {image ? (
          <AvatarImage src={image} alt={name} />
        ) : (
          name.length >= 1 ? name[0]?.toUpperCase() : ""
        )}
      </Avatar>
    );
  };
  
export default UserAvatar;