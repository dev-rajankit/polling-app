export class Poll {
  constructor(question, options, createdBy) {
    this.id = null; // Will be set by storage
    this.question = question;
    this.options = options.map(text => ({
      id: Math.random().toString(36).substr(2, 9),
      text,
      votes: 0
    }));
    this.createdBy = createdBy;
    this.createdAt = new Date().toISOString();
    this.isActive = true;
    this.totalVotes = 0;
  }

  addVote(optionId) {
    const option = this.options.find(opt => opt.id === optionId);
    if (!option) {
      throw new Error('Option not found');
    }
    option.votes++;
    this.totalVotes++;
    return this.getResults();
  }

  getResults() {
    return {
      id: this.id,
      question: this.question,
      options: this.options,
      totalVotes: this.totalVotes,
      isActive: this.isActive,
      createdAt: this.createdAt
    };
  }

  close() {
    this.isActive = false;
  }
}
