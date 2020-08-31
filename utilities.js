function getPercentage(share, total) {
    const percentage = (share / total * 100).toFixed(0);
    return `${percentage} %`
}

module.exports = { getPercentage };