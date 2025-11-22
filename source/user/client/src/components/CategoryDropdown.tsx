import { useState } from "react";
import { Button } from "./ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { Menu, ChevronDown, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import type { PageType } from "../App";

interface CategoryDropdownProps {
    categories: string[];
    categoryTotals: Record<string, number>;
    onNavigate: (page: PageType, data?: any) => void;
}

// Icon mapping cho categories
const getCategoryIcon = (categoryName: string): string => {
    const iconMap: Record<string, string> = {
        "Fiction": "📚",
        "Romance": "💕",
        "Biography": "👤",
        "Self-Help": "⚡",
        "Science Fiction": "🚀",
        "Mystery": "🔍",
        "Fantasy": "🗡️",
        "Comics": "🎨",
        "History": "📜",
        "Business": "💼",
        "Technology": "💻",
        "Cooking": "👨‍🍳",
        "Travel": "✈️",
        "Art": "🎭",
        "Music": "🎵",
        "Sports": "⚽",
        "Health": "🏥",
        "Education": "🎓",
        "Children": "👶",
        "Poetry": "📝",
        // Thêm categories khác nếu cần
    };
    return iconMap[categoryName] || "📖";
};

export function CategoryDropdown({
    categories,
    categoryTotals,
    onNavigate
}: CategoryDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    // Pagination cho GRID (3x2 = 6 categories/page)
    const CATEGORIES_PER_PAGE = 6;
    const totalPages = Math.ceil(categories.length / CATEGORIES_PER_PAGE);

    // Get categories for current page
    const startIndex = (currentPage - 1) * CATEGORIES_PER_PAGE;
    const endIndex = startIndex + CATEGORIES_PER_PAGE;
    const currentCategories = categories.slice(startIndex, endIndex);

    const handleCategoryClick = (category: string) => {
        setIsOpen(false);
        setCurrentPage(1);
        onNavigate('category', { category });
    };

    const handleViewAll = () => {
        setIsOpen(false);
        setCurrentPage(1);
        onNavigate('category', { category: '' });
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <section className="py-8 bg-gradient-to-br from-blue-50/50 to-sky-50/30 border-b">
            <div className="container mx-auto px-4">
                {/* Header with Dropdown */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-3xl font-semibold bg-gradient-to-r from-blue-400 to-sky-500 bg-clip-text text-transparent mb-2">
                            Browse by Category
                        </h2>
                        <p className="text-muted-foreground">
                            Discover books across {categories.length} different categories
                        </p>
                    </div>

                    {/* Dropdown Menu */}
                    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="lg"
                                className="flex items-center gap-2 border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50"
                            >
                                <Menu className="h-5 w-5" />
                                All Categories ({categories.length})
                                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                            align="end"
                            className="w-72 max-h-[500px] overflow-y-auto"
                        >
                            {/* View All Books */}
                            <DropdownMenuItem
                                onClick={handleViewAll}
                                className="cursor-pointer font-semibold text-blue-600 py-3 hover:bg-blue-50"
                            >
                                <BookOpen className="mr-3 h-5 w-5" />
                                <span className="flex-1">View All Books</span>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            {/* Categories List */}
                            {categories.map((categoryName) => {
                                const icon = getCategoryIcon(categoryName);
                                const count = categoryTotals[categoryName] || 0;

                                return (
                                    <DropdownMenuItem
                                        key={categoryName}
                                        onClick={() => handleCategoryClick(categoryName)}
                                        className="cursor-pointer py-2.5 hover:bg-blue-50 group"
                                    >
                                        <span className="mr-3 text-lg group-hover:scale-110 transition-transform">
                                            {icon}
                                        </span>
                                        <span className="flex-1 font-medium">{categoryName}</span>
                                        <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded-full">
                                            {count}
                                        </span>
                                    </DropdownMenuItem>
                                );
                            })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Category Cards Grid với Pagination */}
                <div className="space-y-6">
                    {/* Grid 3x2 */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {currentCategories.map((categoryName) => {
                            const icon = getCategoryIcon(categoryName);
                            const count = categoryTotals[categoryName] || 0;

                            return (
                                <Card
                                    key={categoryName}
                                    onClick={() => handleCategoryClick(categoryName)}
                                    className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-blue-300"
                                >
                                    <CardContent className="p-4 text-center">
                                        <div className="text-3xl mb-2">{icon}</div>
                                        <p className="text-sm font-medium line-clamp-1">{categoryName}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {count} books
                                        </p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handlePrevPage}
                                disabled={currentPage === 1}
                                className="border-2 border-blue-200 hover:bg-blue-50"
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Previous
                            </Button>

                            <div className="flex items-center gap-2">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <Button
                                        key={page}
                                        variant={currentPage === page ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setCurrentPage(page)}
                                        className={currentPage === page ? "bg-blue-600 hover:bg-blue-700" : "border-blue-200"}
                                    >
                                        {page}
                                    </Button>
                                ))}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                                className="border-2 border-blue-200 hover:bg-blue-50"
                            >
                                Next
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    )}

                    {/* Page Indicator */}
                    {totalPages > 1 && (
                        <div className="text-center text-sm text-muted-foreground">
                            Page {currentPage} of {totalPages}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}