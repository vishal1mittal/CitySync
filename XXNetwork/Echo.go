package main

import (
	"log"
	"os"
	"strconv"

	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"
)

func main() {
	// Check if the command-line arguments are provided correctly
	if len(os.Args) < 3 {
		log.Println("Usage: name.exe <chat_id> <message>")
		return
	}

	// Parse command-line arguments
	chatID, err := strconv.ParseInt(os.Args[1], 10, 64)
	if err != nil {
		log.Println("Invalid chat ID:", err)
		return
	}

	message := os.Args[2]

	// Initialize the bot with your token
	bot, err := tgbotapi.NewBotAPI("6432152710:AAGcgX2fJttcDHVgo8r7ttUmYLkMwu3_N1M")
	if err != nil {
		log.Panic(err)
	}

	bot.Debug = true

	// Create a new message to send to the specified chat ID
	msg := tgbotapi.NewMessage(chatID, message)

	// Send the message
	if _, err := bot.Send(msg); err != nil {
		log.Panic(err)
	} else {
		log.Println("Message sent successfully!")
	}
}
