import React, { useState } from "react";
import { Form, Badge , Alert } from 'react-bootstrap';
import { CloseButton } from "./StyleButton";
export const TagField = ({ tags, addTag, removeTag, maxTags }) => {
    // track the user input
    const [userInput, setUserInput] = useState(" ");

    // Handle input onChange
    const handleInputChange = (e) => {
        setUserInput(e.target.value);
    };

    // handle Enter key press
    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            e.preventDefault(); // Prevent form submission or new line creation

            if (
                userInput.trim() !== "" &&
                userInput.length <= 12 &&
                tags.length < maxTags
            ) {
                addTag(userInput);
                setUserInput(""); // Clear the input after adding a tag
            }
        }
    };

    return (
        <div className="flex flex-col w-[300px] md:w-[400px]">
            <Form.Control
                name="keyword_tags"
                type="text"
                placeholder={
                    tags.length < maxTags
                        ? "Add a tag"
                        : `You can only enter max. of ${maxTags} tags`
                }
                onKeyDown={handleKeyPress}
                onChange={handleInputChange}
                value={userInput}
                disabled={tags.length === maxTags}
            />

            {/* ===== Render the tags here ===== */}

            <div className="flex flex-row flex-wrap gap-3 mt-4">
                {tags.map((tag, index) => (
                    <Badge  pill bg="primary"
                        key={`${index}-${tag}`}
                    >
                        {tag}
                        <CloseButton
                           
                            onClick={() => removeTag(tag)}
                            title={`Remove ${tag}`}
                        />
                    </Badge >
                ))}
            </div>
        </div>
    );
};
